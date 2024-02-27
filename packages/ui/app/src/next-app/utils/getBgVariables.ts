import { DocsV1Read } from "@fern-api/fdr-sdk";

const CSS_VARIABLES = {
    BACKGROUND_IMAGE: "--docs-background-image",
};

export function getBgVariables(
    backgroundImageKey: string | undefined,
    files: Record<DocsV1Read.FileId, DocsV1Read.File_>,
): Record<string, string> {
    if (backgroundImageKey == null) {
        return {};
    }

    const backgroundImage = files[backgroundImageKey];

    if (backgroundImage == null) {
        // eslint-disable-next-line no-console
        console.error(`Could not resolve background image file for type ${backgroundImage}.`);
        return {};
    }

    return {
        [CSS_VARIABLES.BACKGROUND_IMAGE]: `url(${backgroundImage.url})`,
    };
}
