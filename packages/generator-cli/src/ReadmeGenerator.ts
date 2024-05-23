import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import fs from "fs";
import { ReadmeConfig } from "./configuration/ReadmeConfig";
import { FernGeneratorCli } from "./configuration/generated";

export class ReadmeGenerator {
    constructor(
        private readonly readmeConfig: ReadmeConfig,
        private readonly featuresConfig: FernGeneratorCli.FeaturesConfig,
        private readonly snippets: FernGeneratorExec.Snippets,
    ) {
        this.readmeConfig = readmeConfig;
        this.featuresConfig = featuresConfig;
        this.snippets = snippets;
    }

    // TODO: Add support for reading in another README.md and applying the changes on top.
    public async generateReadme(stream: fs.WriteStream): Promise<void> {
        console.log(`Got ReadmeConfig: ${JSON.stringify(this.readmeConfig)}`);
        console.log(`Got FeaturesConfig: ${JSON.stringify(this.featuresConfig)}`);
        console.log(`Got Snippets: ${JSON.stringify(this.snippets)}`);
        stream.write("# Hello!\n");
        stream.end();
        return;
    }
}
