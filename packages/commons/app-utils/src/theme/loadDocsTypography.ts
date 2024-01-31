import { DocsV1Read } from "@fern-api/fdr-sdk";

function getFontExtension(url: URL): string {
    const ext = url.pathname.split(".").pop();
    if (ext == null) {
        throw new Error("No extension found for font: " + url.pathname);
    }
    return ext;
}

export type FontType = "headingsFont" | "bodyFont" | "codeFont";

export interface GenerationFontConfig {
    fontType: FontType;
    fontName: string;
    fontExtension: string;
    fontUrl: DocsV1Read.Url;
}

export interface GenerationFontConfigs {
    headingsFont: GenerationFontConfig | undefined;
    bodyFont: GenerationFontConfig | undefined;
    codeFont: GenerationFontConfig | undefined;
}

export function getFontConfig(
    docsDefinition: DocsV1Read.DocsDefinition,
    fontType: FontType,
): GenerationFontConfig | undefined {
    const typographyFontType = docsDefinition.config.typography?.[fontType];
    if (typographyFontType == null) {
        return undefined;
    }
    const fontName = typographyFontType.name;
    const fontUrl = docsDefinition.files[typographyFontType.fontFile];
    if (fontUrl == null) {
        throw new Error(`Could not resolve font file for type ${fontType}.`);
    }
    const fontExtension = getFontExtension(new URL(fontUrl));

    const fontConfig: GenerationFontConfig = {
        fontType,
        fontName,
        fontExtension,
        fontUrl,
    };

    return fontConfig;
}

export function loadDocTypography(docsDefinition: DocsV1Read.DocsDefinition): GenerationFontConfigs {
    const generationConfiguration: Record<keyof GenerationFontConfigs, GenerationFontConfig | undefined> = {
        headingsFont: undefined,
        bodyFont: undefined,
        codeFont: undefined,
    };

    const headingsFontConfig = getFontConfig(docsDefinition, "headingsFont");
    if (headingsFontConfig != null) {
        generationConfiguration.headingsFont = headingsFontConfig;
    }

    const bodyFontConfig = getFontConfig(docsDefinition, "bodyFont");
    if (bodyFontConfig != null) {
        generationConfiguration.bodyFont = bodyFontConfig;
    }

    const codeFontConfig = getFontConfig(docsDefinition, "codeFont");
    if (codeFontConfig != null) {
        generationConfiguration.codeFont = codeFontConfig;
    }

    return generationConfiguration;
}

const BODY_FONT_FALLBACK =
    "-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Open Sans, Helvetica Neue, sans-serif";

const MONO_FONT_FALLBACK = "Menlo, Monaco, monospace";

export function generateFontFaces(generationConfiguration: GenerationFontConfigs, basePath?: string): string {
    const fontFaces: string[] = [];
    let codeFontFaceSet = false;
    let headingFontFaceSet = false;
    let bodyFontFace: string | undefined;

    for (const fontType in generationConfiguration) {
        const fontConfig = generationConfiguration[fontType as keyof GenerationFontConfigs];
        if (fontConfig != null) {
            if (fontConfig.fontType === "headingsFont") {
                const fontFace = `
@font-face {
    font-family: '${fontConfig.fontName}';
    src: url('${fontConfig.fontUrl.toString()}') format('${fontConfig.fontExtension}');
    font-weight: 100 900;
    font-style: normal;
    font-display: swap;
    ascent-override: 100%;
}

:root {
    --typography-heading-font-family: '${fontConfig.fontName}', ${BODY_FONT_FALLBACK};
}
`;
                fontFaces.push(fontFace);
                headingFontFaceSet = true;
            }

            if (fontConfig.fontType === "bodyFont") {
                const fontFace = `
@font-face {
    font-family: '${fontConfig.fontName}';
    src: url('${fontConfig.fontUrl.toString()}') format('${fontConfig.fontExtension}');
    font-weight: 100 900;
    font-style: normal;
    font-display: swap;
    ascent-override: 100%;
}

:root {
    --typography-body-font-family: '${fontConfig.fontName}', ${BODY_FONT_FALLBACK};
}
`;
                fontFaces.push(fontFace);
                bodyFontFace = fontConfig.fontName;
            }

            if (fontConfig.fontType === "codeFont") {
                const fontFace = `
@font-face {
    font-family: '${fontConfig.fontName}';
    src: url('${fontConfig.fontUrl.toString()}') format('${fontConfig.fontExtension}');
    font-weight: 100 900;
    font-style: normal;
    font-display: swap;
    ascent-override: 100%;
}

:root {
    --typography-code-font-family: '${fontConfig.fontName}', ${MONO_FONT_FALLBACK};
}
`;
                fontFaces.push(fontFace);
                codeFontFaceSet = true;
            }
        }
    }

    if (!codeFontFaceSet) {
        const codeBlockFontFace = `
@font-face {
    font-family: "Berkeley Mono";
    src: local("Berkeley Mono"), url("${
        basePath != null && basePath.trim().length > 1 ? basePath : ""
    }/fonts/BerkeleyMono-Regular.woff2") format("woff2");
    font-style: normal;
    font-display: swap;
    ascent-override: 100%;
}

:root {
    --typography-code-font-family: "Berkeley Mono", ${MONO_FONT_FALLBACK};
}
`;
        fontFaces.push(codeBlockFontFace);
    }

    if (!headingFontFaceSet) {
        if (bodyFontFace == null) {
            const headingFontFace = `
:root {
    --typography-heading-font-family: ${BODY_FONT_FALLBACK};
}
`;
            fontFaces.push(headingFontFace);
        } else {
            const headingFontFace = `
:root {
    --typography-heading-font-family: ${bodyFontFace}, ${BODY_FONT_FALLBACK};
}
`;
            fontFaces.push(headingFontFace);
        }
    }

    if (!bodyFontFace) {
        const bodyFontFace = `
:root {
    --typography-body-font-family: ${BODY_FONT_FALLBACK};
}
`;
        fontFaces.push(bodyFontFace);
    }

    return fontFaces.join("\n");
}
