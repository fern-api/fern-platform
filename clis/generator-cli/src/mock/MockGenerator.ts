import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { Logger } from "@fern-api/logger";
import { writeFile } from "fs/promises";
import { FernGeneratorCli } from "../configuration/generated";
import { FileDownloader } from "../utils/FileDownloader";

const FERN_CONFIG_FILENAME = "fern.config.json";
const MOCK_DIRECTORY = ".mock";

export class MockGenerator {
    private logger: Logger;
    private mockConfig: FernGeneratorCli.MockConfig;
    private fileDownloader: FileDownloader;

    constructor({ logger, mockConfig }: { logger: Logger; mockConfig: FernGeneratorCli.MockConfig }) {
        this.logger = logger;
        this.mockConfig = mockConfig;
        this.fileDownloader = new FileDownloader({ logger });
    }

    public async generate({ output }: { output: AbsoluteFilePath }): Promise<void> {
        const absolutePathToOutput = join(output, RelativeFilePath.of(MOCK_DIRECTORY));
        await this.fileDownloader.downloadAndUnzip({
            downloadURL: this.mockConfig.definitionUrl,
            absolutePathToOutput,
        });
        await this.writeFernConfig({ absolutePathToOutput });
    }

    private async writeFernConfig({ absolutePathToOutput }: { absolutePathToOutput: AbsoluteFilePath }): Promise<void> {
        this.logger.debug(`Writing ${FERN_CONFIG_FILENAME} to ${absolutePathToOutput}`);
        const fernConfig: FernGeneratorCli.FernConfigJson = {
            organization: this.mockConfig.organization,
            version: this.mockConfig.cliVersion,
        };
        const absolutePathToFernConfigJson = join(absolutePathToOutput, RelativeFilePath.of(FERN_CONFIG_FILENAME));
        await writeFile(absolutePathToFernConfigJson, JSON.stringify(fernConfig, undefined, 2));
    }
}
