import { DocsV1Read } from "@fern-api/fdr-sdk";

const CSS_VARIABLES = {
    BACKGROUND_IMAGE: "--docs-background-image",
};

export function getBgVariables(
    config: DocsV1Read.DocsConfig,
    files: Record<DocsV1Read.FileId, DocsV1Read.Url>,
): Record<string, string> {
    const backgroundImage = config.backgroundImage;
    if (backgroundImage == null) {
        return {};
    }

    const backgroundImageUrl = files[backgroundImage];

    if (backgroundImageUrl == null) {
        // eslint-disable-next-line no-console
        console.error(`Could not resolve background image file for type ${backgroundImageUrl}.`);
        return {};
    }

    return {
        [CSS_VARIABLES.BACKGROUND_IMAGE]: `url(${backgroundImageUrl})`,
    };
}
