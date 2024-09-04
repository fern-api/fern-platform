import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { Logger } from "@fern-api/logger";
import extract from "extract-zip";
import { createWriteStream } from "fs";
import { pipeline } from "stream";
import tmp from "tmp-promise";
import { promisify } from "util";

export class FileDownloader {
    private logger: Logger;

    constructor({ logger }: { logger: Logger }) {
        this.logger = logger;
    }

    public async downloadAndUnzip({
        downloadURL,
        absolutePathToOutput,
    }: {
        downloadURL: string;
        absolutePathToOutput: AbsoluteFilePath;
    }): Promise<void> {
        const downloadAbsoluteFilePath = AbsoluteFilePath.of((await tmp.dir()).path);
        await this.downloadFile({
            downloadURL,
            absolutePathToOutput: downloadAbsoluteFilePath,
        });
        await extract(downloadAbsoluteFilePath, { dir: absolutePathToOutput });
    }

    private async downloadFile({
        downloadURL,
        absolutePathToOutput,
    }: {
        downloadURL: string;
        absolutePathToOutput: string;
    }): Promise<void> {
        this.logger.debug(`Downloading ${downloadURL} to ${absolutePathToOutput}`);
        const response = await fetch(downloadURL);
        if (!response.ok) {
            throw new Error(`Failed to download file. Status: ${response.status}, ${response.statusText}`);
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await promisify(pipeline)(response.body as any, createWriteStream(absolutePathToOutput));
    }
}
