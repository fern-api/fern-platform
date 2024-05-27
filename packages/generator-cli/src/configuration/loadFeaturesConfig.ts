import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { readFile } from "fs/promises";
import yaml from "js-yaml";
import path from "path";
import { FernGeneratorCli } from "./generated";

export async function loadFeaturesConfig({
    absolutePathToConfig,
}: {
    absolutePathToConfig: AbsoluteFilePath;
}): Promise<FernGeneratorCli.FeaturesConfig> {
    const rawContents = await readFile(absolutePathToConfig, "utf8");
    const extension = path.extname(absolutePathToConfig);
    if (extension === ".yaml" || extension === ".yml") {
        return yaml.load(rawContents) as FernGeneratorCli.FeaturesConfig;
    }
    return JSON.parse(rawContents) as FernGeneratorCli.FeaturesConfig;
}
