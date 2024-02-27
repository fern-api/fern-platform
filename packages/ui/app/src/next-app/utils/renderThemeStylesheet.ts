import { DocsV1Read } from "@fern-api/fdr-sdk";
import tinycolor from "tinycolor2";
import { getBgVariables } from "./getBgVariables";
import { CSS_VARIABLES, getColorVariables } from "./getColorVariables";
import { getFontVariables } from "./getFontVariables";
import { getLayoutVariables } from "./getLayoutVariables";

export function renderThemeStylesheet(
    backgroundImage: string | undefined,
    colorsConfig: DocsV1Read.ColorsConfigV3 | undefined,
    typography: DocsV1Read.DocsTypographyConfigV2 | undefined,
    layoutConfig: DocsV1Read.DocsLayoutConfig | undefined,
    css: DocsV1Read.CssConfig | undefined,
    files: Record<DocsV1Read.FileId, DocsV1Read.File_>,
): string {
    const bg = getBgVariables(backgroundImage, files);
    const { fontFaces, cssVariables: fonts, additionalCss } = getFontVariables(typography, files);
    const colors = getColorVariables(colorsConfig);
    const layout = getLayoutVariables(layoutConfig);

    const cssVariables = {
        ...bg,
        ...fonts,
        ...colors,
        ...layout,
    };

    const bgColor = `#${tinycolor(`rgb(${colors[CSS_VARIABLES.BACKGROUND_LIGHT]})`).toHex()}`;
    const bgDarkColor = `#${tinycolor(`rgb(${colors[CSS_VARIABLES.BACKGROUND_DARK]})`).toHex()}`;

    const inlinedCss = css?.inline?.join("\n\n") ?? "";

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

${inlinedCss}
`;
}
