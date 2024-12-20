import AdmZip from "adm-zip";
import { createWriteStream } from "fs";
import { unlink } from "fs/promises";
import path from "path";
import { pipeline } from "stream";
import tmp from "tmp-promise";
import { promisify } from "util";

export interface FetchAndUnzipRequest {
  destination: string;
  sourceUrl: string;
}

const ZIP_FILENAME = "source.zip";

export async function fetchAndUnzip(
  request: FetchAndUnzipRequest
): Promise<void> {
  const destinationPath = path.join((await tmp.dir()).path, ZIP_FILENAME);
  await downloadFile({
    sourceUrl: request.sourceUrl,
    destinationPath,
  });

  console.debug(
    `Unzipping source from ${destinationPath} to ${request.destination}`
  );
  await unzipFile(destinationPath, request.destination);

  console.debug(`Removing ${destinationPath}`);
  await unlink(destinationPath);
}

async function unzipFile(
  sourcePath: string,
  destinationPath: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const zip = new AdmZip(sourcePath);

      // Extract all files
      zip.extractAllTo(destinationPath, true);

      console.log(`Successfully extracted ${sourcePath} to ${destinationPath}`);
      resolve();
    } catch (error) {
      console.error(`Error unzipping file: ${error}`);
      reject(error as Error);
    }
  });
}

async function downloadFile({
  sourceUrl,
  destinationPath,
}: {
  sourceUrl: string;
  destinationPath: string;
}): Promise<void> {
  console.debug(`Downloading ${sourceUrl} to ${destinationPath}`);
  const response = await fetch(sourceUrl);
  if (!response.ok) {
    throw new Error(
      `Failed to download source. Status: ${response.status}, ${response.statusText}`
    );
  }
  const fileStream = createWriteStream(destinationPath);

  await promisify(pipeline)(response.body as any, fileStream);
}
