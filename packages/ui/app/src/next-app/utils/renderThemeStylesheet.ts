import { DocsV1Read } from "@fern-api/fdr-sdk";
import tinycolor from "tinycolor2";
import { getBgVariables } from "./getBgVariables";
import { CSS_VARIABLES, getColorVariables } from "./getColorVariables";
import { getFontVariables } from "./getFontVariables";
import { getLayoutVariables } from "./getLayoutVariables";

export function renderThemeStylesheet(
    config: DocsV1Read.DocsConfig,
    files: Record<DocsV1Read.FileId, DocsV1Read.Url>,
): string {
    const bg = getBgVariables(config, files);
    const { fontFaces, cssVariables: fonts, additionalCss } = getFontVariables(config.typographyV2, files);
    const colors = getColorVariables(config.colorsV3);
    const layout = getLayoutVariables(config.layout);

    const cssVariables = {
        ...bg,
        ...fonts,
        ...colors,
        ...layout,
    };

    const bgColor = `#${tinycolor(`rgb(${colors[CSS_VARIABLES.BACKGROUND]})`).toHex()}`;
    const bgDarkColor = `#${tinycolor(`rgb(${colors[CSS_VARIABLES.BACKGROUND_DARK]})`).toHex()}`;

    return `
:root {
    ${Object.entries(cssVariables)
        .map(([key, value]) => `${key}: ${value};`)
        .join("\n    ")}
}

${fontFaces.join("\n\n")}

html {
    background-color: ${bgColor};
}

html.dark {
    background-color: ${bgDarkColor};
}

${additionalCss}
`;
}
