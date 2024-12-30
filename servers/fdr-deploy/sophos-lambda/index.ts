import { S3 } from "@aws-sdk/client-s3";
import { S3Event } from "aws-lambda";
import * as crypto from "crypto";
import * as fs from "fs";
import * as path from "path";
import { v4 as uuidv4 } from "uuid";

interface SophosResponse {
  jobId?: string;
  report?: {
    score: number;
  };
  reputationScore?: number;
}

class SophosIntelixScanner {
  private accessToken: string = "";
  private s3Client: S3;

  constructor() {
    this.s3Client = new S3({});
  }

  private async login(): Promise<void> {
    // Don't login if we already have a token
    if (this.accessToken !== "") {
      return;
    }

    const credentials = process.env.INTELIX_CREDENTIALS;
    if (!credentials) {
      throw new Error(
        "Missing credentials, please set environment variable INTELIX_CREDENTIALS"
      );
    }

    const authString = `Basic ${credentials}`;
    const response = await fetch("https://api.labs.sophos.com/oauth2/token", {
      method: "POST",
      headers: {
        Authorization: authString,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });

    if (!response.ok) {
      throw new Error("Could not login to Sophos Intelix");
    }

    const data = await response.json();
    this.accessToken = data.access_token;
  }

  private async getAnalysis(
    filename: string,
    url: string
  ): Promise<SophosResponse> {
    await this.login();

    const formData = new FormData();
    formData.append("file", new Blob([fs.readFileSync(filename)]));

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: this.accessToken,
      },
      body: formData,
    });

    if (response.status === 200) {
      return response.json();
    } else if (response.status === 202) {
      const data = await response.json();
      const jobId = data.jobId;
      const reportUrl = `${url}reports/${jobId}`;

      // Poll every 5 seconds for up to 20 minutes
      for (let i = 0; i < 240; i++) {
        await new Promise((resolve) => setTimeout(resolve, 5000));
        const reportResponse = await fetch(reportUrl, {
          headers: { Authorization: this.accessToken },
        });

        if (reportResponse.status === 200) {
          return reportResponse.json();
        }
        if (reportResponse.status !== 202) {
          break;
        }
      }
    }

    throw new Error("Analysis failed or timed out");
  }

  private async getFileHash(filename: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const hash = crypto.createHash("sha256");
      const stream = fs.createReadStream(filename);

      stream.on("error", (err) => reject(err));
      stream.on("data", (chunk) => hash.update(chunk));
      stream.on("end", () => resolve(hash.digest("hex")));
    });
  }

  private async cloudLookup(fileHash: string): Promise<number> {
    await this.login();

    const response = await fetch(
      `https://de.api.labs.sophos.com/lookup/files/v1/${fileHash}`,
      { headers: { Authorization: this.accessToken } }
    );

    if (!response.ok) {
      throw new Error("Cloud lookup failed");
    }

    const data = await response.json();
    console.log("Score:", data.reputationScore);
    console.log("Raw response:", JSON.stringify(data, null, 4));
    return data.reputationScore;
  }

  private async staticAnalysis(filename: string): Promise<number> {
    const response = await this.getAnalysis(
      filename,
      "https://de.api.labs.sophos.com/analysis/file/static/v1/"
    );

    console.log("Score:", response.report?.score);
    console.log("Raw response:", JSON.stringify(response, null, 4));
    return response.report?.score ?? 0;
  }

  private async dynamicAnalysis(filename: string): Promise<number> {
    const response = await this.getAnalysis(
      filename,
      "https://de.api.labs.sophos.com/analysis/file/dynamic/v1/"
    );

    console.log("Score:", response.report?.score);
    console.log("Raw response:", JSON.stringify(response, null, 4));
    return response.report?.score ?? 0;
  }

  public async completeCheckForMalware(filename: string): Promise<boolean> {
    const fileHash = await this.getFileHash(filename);

    console.log("Running a cloud lookup...");
    const lookupScore = await this.cloudLookup(fileHash);

    if (lookupScore < 20) {
      console.log("File is malicious based on Cloud lookup!!!");
      return true;
    } else if (lookupScore >= 70) {
      console.log("File is clean based on Cloud lookup.");
      return false;
    }

    console.log("Proceeding to static analysis...");
    const staticScore = await this.staticAnalysis(filename);
    if (staticScore < 20) {
      console.log("File is malicious based on Static Analysis!!!");
      return true;
    } else if (staticScore > 70) {
      console.log("File is clean based on Static Analysis.");
      return false;
    }

    console.log("Proceeding to dynamic analysis...");
    const dynamicScore = await this.dynamicAnalysis(filename);
    if (dynamicScore < 20) {
      console.log("File is malicious based on Dynamic Analysis!!!");
      return true;
    } else {
      console.log("File is clean based on Dynamic Analysis.");
      return false;
    }
  }
}

// Lambda handler
export const handler = async (event: S3Event): Promise<void> => {
  console.log("Event is:", JSON.stringify(event));

  const scanner = new SophosIntelixScanner();
  const s3Client = new S3({});

  for (const record of event.Records) {
    const bucket = record.s3.bucket.name;
    const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, " "));
    const tmpKey = key.replace("/", "");
    const downloadPath = path.join("/tmp", `${uuidv4()}${tmpKey}`);

    try {
      // Download the file
      await s3Client.getObject({
        Bucket: bucket,
        Key: key,
        ResponseContentFile: downloadPath,
      });

      // Scan the file
      const isMalware = await scanner.completeCheckForMalware(downloadPath);

      if (isMalware) {
        console.log(
          `This file CONTAINS MALWARE!! Removing file upload... s3://${bucket}/${key}`
        );
        await s3Client.deleteObject({ Bucket: bucket, Key: key });
      } else {
        const outputBucket = process.env.QUARANTINE_BUCKET;
        if (!outputBucket) {
          throw new Error("OUTPUT_BUCKET environment variable not set");
        }

        console.log(
          `This file is clean, copying to quarantine bucket: ${outputBucket}`
        );
        await s3Client.copyObject({
          CopySource: `${bucket}/${key}`,
          Bucket: outputBucket,
          Key: key,
        });

        await s3Client.deleteObject({ Bucket: bucket, Key: key });
      }

      // Clean up temporary file
      fs.unlinkSync(downloadPath);
    } catch (error) {
      console.error(`Error processing file ${key}:`, error);
      throw error;
    }
  }
};
