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
    const destinationPath = path.join((await tmp.dir()).path, ZIP_FILENAME);
    await downloadFile({
        sourceUrl: request.sourceUrl,
        destinationPath,
    });

    console.debug(`Unzipping source from ${destinationPath} to ${request.destination}`);
    await loggingExeca("unzip", ["-o", destinationPath, "-d", request.destination], {
        doNotPipeOutput: true,
    });

    console.debug(`Removing ${destinationPath}`);
    await unlink(destinationPath);
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
