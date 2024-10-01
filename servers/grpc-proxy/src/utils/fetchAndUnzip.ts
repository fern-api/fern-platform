import AdmZip from "adm-zip";
import { createWriteStream } from "fs";
import { unlink } from "fs/promises";
import path from "path";
import { pipeline } from "stream";
import tmp from "tmp-promise";
import { promisify } from "util";
import { loggingExeca } from "./loggingExeca";

export interface FetchAndUnzipRequest {
    destination: string;
    sourceUrl: string;
}

const ZIP_FILENAME = "source.zip";

export async function fetchAndUnzip(request: FetchAndUnzipRequest): Promise<void> {
    const sourcePath = path.join((await tmp.dir()).path, ZIP_FILENAME);
    await downloadFile({
        sourceUrl: request.sourceUrl,
        destinationPath: sourcePath,
    });

    console.debug(`Unzipping source from ${sourcePath} to ${request.destination}`);
    await loggingExeca("unzip", ["-o", sourcePath, "-d", request.destination], {
        doNotPipeOutput: true,
    });
    await unzipFile(sourcePath, request.destination);

    console.debug(`Removing ${sourcePath}`);
    await unlink(sourcePath);
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
        throw new Error(`Failed to download source. Status: ${response.status}, ${response.statusText}`);
    }
    const fileStream = createWriteStream(destinationPath);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await promisify(pipeline)(response.body as any, fileStream);
}

async function unzipFile(sourcePath: string, destinationPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
        try {
            const zip = new AdmZip(sourcePath);

            zip.extractAllTo(destinationPath, true);

            console.log(`Successfully extracted ${sourcePath} to ${destinationPath}`);
            resolve();
        } catch (error) {
            console.error(`Error unzipping file: ${error}`);
            reject(error);
        }
    });
}
