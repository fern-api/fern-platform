import type { DocsV1Read } from "@fern-api/fdr-sdk/client/types";

export function getFontExtension(url: string): string {
  const ext = url.split(".").pop();
  if (ext == null) {
    throw new Error("No extension found for font: " + url);
  }
  return ext;
}

function generateFontFace(
  variant: DocsV1Read.CustomFontConfigVariant,
  fontConfig: DocsV1Read.FontConfigV2,
  files: Record<string, { src: string }>
): string | undefined {
  const file = files[variant.fontFile];
  if (file == null) {
    return undefined;
  }
  let fontExtension: string;
  try {
    fontExtension = getFontExtension(new URL(file.src).pathname);
  } catch (_) {
    fontExtension = getFontExtension(file.src);
  }
  const lines: string[] = [
    `font-family: '${fontConfig.name}'`,
    `src: url('${file.src}') format('${fontExtension}')`,
    `font-weight: ${variant.weight?.join(" ") ?? "100 900"}`,
    `font-style: ${variant.style?.[0] ?? "normal"}`,
    `font-display: ${fontConfig.display ?? "swap"}`,
  ];

  return `@font-face {\n${lines.map((line) => `    ${line}`).join(";\n")};\n}`;
}

interface TypographyResult {
  fontFaces: string[];
  bodyFont?: string;
  headingFont?: string;
  codeFont?: string;
  additionalCss: string;
}

export function generateFonts(
  typography: DocsV1Read.DocsTypographyConfigV2 | undefined,
  files: Record<string, { src: string }>
): TypographyResult {
  const fontFaces: string[] = [];
  let additionalCss = "";
  let bodyFont: string | undefined;
  let headingFont: string | undefined;
  let codeFont: string | undefined;

  if (typography?.bodyFont?.variants != null) {
    let setVariant = false;
    for (const variant of typography.bodyFont.variants) {
      const fontFace = generateFontFace(variant, typography.bodyFont, files);
      if (fontFace != null) {
        fontFaces.push(fontFace);
        setVariant = true;
      }
    }
    if (setVariant) {
      const fallback = typography.bodyFont.fallback?.join(", ");
      bodyFont = `'${typography.bodyFont.name}'${fallback ? `, ${fallback}` : ""}`;
    }
  }

  if (typography?.headingsFont?.variants != null) {
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
      const fallback = typography.headingsFont.fallback?.join(", ");
      headingFont = `'${typography.headingsFont.name}'${
        fallback ? `, ${fallback}` : ""
      }`;
    }

    if (typography.headingsFont.fontVariationSettings != null) {
      additionalCss += `h1, h2, h3 {\n    font-variation-settings: ${typography.headingsFont.fontVariationSettings};\n}\n`;
    }
  }

  if (typography?.codeFont?.variants != null) {
    let setVariant = false;
    for (const variant of typography.codeFont.variants) {
      const fontFace = generateFontFace(variant, typography.codeFont, files);
      if (fontFace != null) {
        fontFaces.push(fontFace);
        setVariant = true;
      }
    }
    if (setVariant) {
      const fallback = typography.codeFont.fallback?.join(", ");
      codeFont = `'${typography.codeFont.name}'${
        fallback ? `, ${fallback}` : ""
      }`;
    }
  }

  return {
    fontFaces,
    bodyFont,
    headingFont,
    codeFont,
    additionalCss,
  };
}
