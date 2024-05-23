import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { ReadmeConfig } from "./ReadmeConfig";

// TODO: For now, this just encodes the ReadmeConfig statically while we figure out the final shape.
// This will eventually be defined as a generator-cli fern definition.
export async function loadReadmeConfig({
    _absolutePathToConfig,
}: {
    _absolutePathToConfig: AbsoluteFilePath;
}): Promise<ReadmeConfig> {
    return {
        bannerLink: undefined,
        docsLink: undefined,
        installation: undefined,
        requirements: undefined,
        features: [],
    };
}
