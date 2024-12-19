import type { DocsV1Read } from "@fern-api/fdr-sdk/client/types";

export const CSS_VARIABLES = {
    BODY_FONT: "--typography-body-font-family",
    HEADING_FONT: "--typography-heading-font-family",
    CODE_FONT: "--typography-code-font-family",
};

export function getFontExtension(url: string): string {
    const ext = url.split(".").pop();
    if (ext == null) {
        throw new Error("No extension found for font: " + url);
    }
    return ext;
}

const BODY_FONT_FALLBACK =
    "-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Oxygen,Ubuntu,Cantarell,Open Sans,Helvetica Neue,sans-serif";

const MONO_FONT_FALLBACK =
    "ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace";

function generateFontFace(
    variant: DocsV1Read.CustomFontConfigVariant,
    fontConfig: DocsV1Read.FontConfigV2,
    files: Record<DocsV1Read.FileId, DocsV1Read.File_>
): string | undefined {
    const file = files[variant.fontFile];
    if (file == null) {
        return undefined;
    }
    let fontExtension: string;
    try {
        fontExtension = getFontExtension(new URL(file.url).pathname);
    } catch (err) {
        fontExtension = getFontExtension(file.url);
    }
    const lines: string[] = [
        `font-family: '${fontConfig.name}'`,
        `src: url('${file.url}') format('${fontExtension}')`,
        `font-weight: ${variant.weight?.join(" ") ?? "100 900"}`,
        `font-style: ${variant.style?.[0] ?? "normal"}`,
        `font-display: ${fontConfig.display ?? "swap"}`,
    ];

    return `@font-face {\n${lines.map((line) => `    ${line}`).join(";\n")};\n}`;
}

interface TypographyResult {
    fontFaces: string[];
    cssVariables: Record<string, string>;
    additionalCss: string;
}

export function getFontVariables(
    typography: DocsV1Read.DocsTypographyConfigV2 | undefined,
    files: Record<DocsV1Read.FileId, DocsV1Read.File_>
): TypographyResult {
    const fontFaces: string[] = [];
    const cssVariables: Record<string, string> = {
        [CSS_VARIABLES.BODY_FONT]: BODY_FONT_FALLBACK,
        [CSS_VARIABLES.HEADING_FONT]: BODY_FONT_FALLBACK,
        [CSS_VARIABLES.CODE_FONT]: MONO_FONT_FALLBACK,
    };
    let additionalCss: string = "";

    if (typography?.bodyFont != null && typography.bodyFont.variants != null) {
        let setVariant = false;
        for (const variant of typography.bodyFont.variants) {
            const fontFace = generateFontFace(
                variant,
                typography.bodyFont,
                files
            );
            if (fontFace != null) {
                fontFaces.push(fontFace);
                setVariant = true;
            }
        }
        if (setVariant) {
            cssVariables[CSS_VARIABLES.BODY_FONT] =
                `'${typography.bodyFont.name}', ${
                    typography.bodyFont.fallback?.join(", ") ??
                    BODY_FONT_FALLBACK
                }`;
        }
    }

    if (
        typography?.headingsFont != null &&
        typography.headingsFont.variants != null
    ) {
        let setVariant = false;
        for (const variant of typography.headingsFont.variants) {
            const fontFace = generateFontFace(
                variant,
                typography.headingsFont,
                files
            );
            if (fontFace != null) {
                fontFaces.push(fontFace);
                setVariant = true;
            }
        }
        if (setVariant) {
            cssVariables[CSS_VARIABLES.HEADING_FONT] =
                `'${typography.headingsFont.name}', ${
                    typography.headingsFont.fallback?.join(", ") ??
                    BODY_FONT_FALLBACK
                }`;
        }

        if (typography.headingsFont.fontVariationSettings != null) {
            additionalCss += `h1, h2, h3 {\n    font-variation-settings: ${typography.headingsFont.fontVariationSettings};\n}\n`;
        }
    }

    if (typography?.codeFont != null && typography.codeFont.variants != null) {
        let setVariant = false;
        for (const variant of typography.codeFont.variants) {
            const fontFace = generateFontFace(
                variant,
                typography.codeFont,
                files
            );
            if (fontFace != null) {
                fontFaces.push(fontFace);
                setVariant = true;
            }
        }
        if (setVariant) {
            cssVariables[CSS_VARIABLES.CODE_FONT] =
                `'${typography.codeFont.name}', ${
                    typography.codeFont.fallback?.join(", ") ??
                    MONO_FONT_FALLBACK
                }`;
        }
    }

    return {
        fontFaces,
        cssVariables,
        additionalCss,
    };
}
