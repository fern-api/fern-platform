import { DocsV1Read } from "@fern-api/fdr-sdk";

export function loadDocsBackgroundImage(docsDefinition: DocsV1Read.DocsDefinition): string | undefined {
    const backgroundImage = docsDefinition.config.backgroundImage;
    if (backgroundImage == null) {
        return undefined;
    }

    const backgroundImageUrl = docsDefinition.files[backgroundImage];

    if (backgroundImageUrl == null) {
        throw new Error(`Could not resolve background image file for type ${backgroundImageUrl}.`);
    }

    const stylesheet = `
      :root {
        --docs-background-image: url(${backgroundImageUrl});
      }
    `;

    return stylesheet;
}
