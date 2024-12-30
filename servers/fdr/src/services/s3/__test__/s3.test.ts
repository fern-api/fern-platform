import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import fs from "fs";
import { readFile } from "fs/promises";
import path from "path";
import { pipeline } from "stream";
import { promisify } from "util";
import { v4 as uuidv4 } from "uuid";

const streamPipeline = promisify(pipeline);

const AWS_ACCESS_KEY = "AWS_ACCESS_KEY";
const AWS_SECRET_KEY = "AWS_SECRET_KEY";

const AWS_BUCKET_NAME = "AWS_BUCKET_NAME";

it.skip("presigned URLs", async () => {
    const client = new S3Client({
        region: "us-east-1",
        credentials: {
            accessKeyId: AWS_ACCESS_KEY,
            secretAccessKey: AWS_SECRET_KEY,
        },
    });

    const time: string = new Date().toISOString();
    const sourceId: string = uuidv4();

    const putCommand = new PutObjectCommand({
        Bucket: AWS_BUCKET_NAME,
        Key: `fern/fern/${time}/${sourceId}`,
    });

    const uploadUrl = await getSignedUrl(client, putCommand, { expiresIn: 3600 });
    expect(uploadUrl).not.toBe(null);
    expect(uploadUrl.length).greaterThan(0);

    console.log("Upload URL: ", uploadUrl);

    const getCommand = new GetObjectCommand({
        Bucket: AWS_BUCKET_NAME,
        Key: `fern/fern/${time}/${sourceId}`,
    });
    const downloadUrl = await getSignedUrl(client, getCommand, { expiresIn: 604800 });
    expect(downloadUrl).not.toBe(null);
    expect(downloadUrl.length).greaterThan(0);

    console.log("Download URL: ", uploadUrl);

    console.log("Uploading zip ...");
    await uploadFile(path.join(__dirname, "proto.zip"), uploadUrl);

    console.log("Downloading zip ...");
    await downloadFile("./proto.downloaded.zip", downloadUrl);

    console.log("Success!");
}, 100_000);

async function uploadFile(filePath: string, uploadUrl: string): Promise<void> {
    try {
        const fileData = await readFile(filePath);
        const response = await fetch(uploadUrl, {
            method: "PUT",
            body: fileData,
            headers: {
                "Content-Type": "application/octet-stream",
            },
        });
        if (response.ok) {
            console.log("File uploaded successfully!");
        } else {
            console.error(`Failed to upload file. Status: ${response.status}, ${response.statusText}`);
        }
    } catch (error) {
        console.error("Error uploading file:", error);
    }
}

async function downloadFile(savePath: string, downloadUrl: string): Promise<void> {
    try {
        const response = await fetch(downloadUrl);
        if (!response.ok) {
            throw new Error(`Failed to download file. Status: ${response.status}, ${response.statusText}`);
        }
        const fileStream = fs.createWriteStream(savePath);
        await streamPipeline(response.body as any, fileStream);

        console.log("File downloaded successfully!");
    } catch (error) {
        console.error("Error downloading file:", error);
    }
}
