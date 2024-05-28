import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { readFile } from "fs/promises";
import yaml from "js-yaml";
import { FernGeneratorCli } from "./generated";

export async function loadFeaturesConfig({
    absolutePathToConfig,
}: {
    absolutePathToConfig: AbsoluteFilePath;
}): Promise<FernGeneratorCli.FeaturesConfig | undefined> {
    const rawContents = await readFile(absolutePathToConfig, "utf8");
    if (rawContents.length === 0) {
        // TODO: Log a warning.
        return undefined;
    }
    return yaml.load(rawContents) as FernGeneratorCli.FeaturesConfig;
}
