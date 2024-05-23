import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { readFile } from "fs/promises";
import { FernGeneratorCli } from "./generated";

// TODO: Add support for reading YAML files.
export async function loadFeaturesConfig({
    absolutePathToConfig,
}: {
    absolutePathToConfig: AbsoluteFilePath;
}): Promise<FernGeneratorCli.FeaturesConfig> {
    const rawContents = await readFile(absolutePathToConfig, "utf8");
    return JSON.parse(rawContents) as FernGeneratorCli.FeaturesConfig;
}
