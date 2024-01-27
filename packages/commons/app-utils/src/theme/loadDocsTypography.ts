import { DocsV1Read } from "@fern-api/fdr-sdk";

function getFontExtension(url: string): string {
    const ext = url.split(".").pop();
    if (ext == null) {
        throw new Error("No extension found for font: " + url);
    }
    return ext;
}

const BODY_FONT_FALLBACK =
    "-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Open Sans, Helvetica Neue, sans-serif";

const MONO_FONT_FALLBACK = "Menlo, Monaco, monospace";

function generateFontFace(
    variant: DocsV1Read.CustomFontConfigVariant,
    fontConfig: DocsV1Read.FontConfigV2,
    files: Record<DocsV1Read.FileId, DocsV1Read.Url>
): string | undefined {
    const file = files[variant.fontFile];
    if (file == null) {
        return undefined;
    }
    const lines: string[] = [
        `font-family: '${fontConfig.name}'`,
        `src: url('${file}') format('${getFontExtension(new URL(file).pathname)}')`,
        `font-weight: ${variant.weight?.join(" ") ?? "100 900"}`,
        `font-style: ${variant.style?.[0] ?? "normal"}`,
        `font-display: ${fontConfig.display ?? "swap"}`,
    ];

    return `@font-face {\n${lines.map((line) => `    ${line}`).join(";\n")};\n}`;
}

export function generateFontFaces(
    typography: DocsV1Read.DocsTypographyConfigV2 | undefined,
    files: Record<DocsV1Read.FileId, DocsV1Read.Url>
): string {
    if (typography == null) {
        return "";
    }
    const fontFaces: string[] = [];
    const variables: string[] = [];
    let additionalCss: string = "";
    if (typography.bodyFont != null && typography.bodyFont.variants != null) {
        let setVariant = false;
        for (const variant of typography.bodyFont.variants) {
            const fontFace = generateFontFace(variant, typography.bodyFont, files);
            if (fontFace != null) {
                fontFaces.push(fontFace);
                setVariant = true;
            }
        }
        if (setVariant) {
            variables.push(
                `--typography-body-font-family: '${typography.bodyFont.name}', ${
                    typography.bodyFont.fallback?.join(", ") ?? BODY_FONT_FALLBACK
                }`
            );
        } else {
            variables.push(`--typography-body-font-family: ${BODY_FONT_FALLBACK}`);
        }
    } else {
        variables.push(`--typography-body-font-family: ${BODY_FONT_FALLBACK}`);
    }

    if (typography.headingsFont != null && typography.headingsFont.variants != null) {
        let setVariant = false;
        for (const variant of typography.headingsFont.variants) {
            const fontFace = generateFontFace(variant, typography.headingsFont, files);
            if (fontFace != null) {
                fontFaces.push(fontFace);
                setVariant = true;
            }
        }
        if (setVariant) {
            variables.push(
                `--typography-heading-font-family: '${typography.headingsFont.name}', ${
                    typography.headingsFont.fallback?.join(", ") ?? BODY_FONT_FALLBACK
                }`
            );
        } else {
            variables.push(`--typography-heading-font-family: ${BODY_FONT_FALLBACK}`);
        }

        if (typography.headingsFont.fontVariationSettings != null) {
            additionalCss += `h1, h2, h3 {\n    font-variation-settings: ${typography.headingsFont.fontVariationSettings};\n}\n`;
        }
    } else {
        variables.push(`--typography-heading-font-family: ${BODY_FONT_FALLBACK}`);
    }

    if (typography.codeFont != null && typography.codeFont.variants != null) {
        let setVariant = false;
        for (const variant of typography.codeFont.variants) {
            const fontFace = generateFontFace(variant, typography.codeFont, files);
            if (fontFace != null) {
                fontFaces.push(fontFace);
                setVariant = true;
            }
        }
        if (setVariant) {
            variables.push(
                `--typography-code-font-family: '${typography.codeFont.name}', ${
                    typography.codeFont.fallback?.join(", ") ?? MONO_FONT_FALLBACK
                }`
            );
        } else {
            variables.push(`--typography-code-font-family: ${MONO_FONT_FALLBACK}`);
        }
    } else {
        variables.push(`--typography-code-font-family: ${MONO_FONT_FALLBACK}`);
    }

    return `${fontFaces.join("\n")}\n\n:root {\n${variables
        .map((line) => `    ${line};`)
        .join("\n")}\n}\n${additionalCss}`;
}
