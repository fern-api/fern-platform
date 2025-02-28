"use client";

import { FERN_COLOR_ACCENT } from "@fern-docs/utils";

import { FernFonts } from "@/server/generateFonts";
import { ArrayOf12 } from "@/server/generateRadixColors";
import { FernColorTheme, FernLayoutConfig } from "@/server/types";

const FONT_MONO =
  "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace";
const FONT_SANS =
  "ui-sans-serif, system-ui, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'";

export function GlobalStyles({
  domain,
  layout,
  light,
  dark,
  fonts,
  inlineCss = [],
}: {
  domain: string;
  layout: FernLayoutConfig;
  light?: FernColorTheme;
  dark?: FernColorTheme;
  fonts: FernFonts;
  inlineCss?: string[];
}) {
  const root = light ?? dark;
  const hasTheme = !!light && !!dark;
  return (
    <style jsx global key="__fern-global-styles">
      {`
        ${fonts.fontFaces.join("\n")}

        :root {
          --font-body: ${createFontFamilyCss(fonts.bodyFont, FONT_SANS)};
          --font-heading: ${createFontFamilyCss(
            fonts.headingFont,
            createFontFamilyCss(fonts.bodyFont, FONT_SANS)
          )};
          --font-code: ${createFontFamilyCss(fonts.codeFont, FONT_MONO)};
          ${domain.includes("nominal") ? "--radius: 0px;" : ""}
          --header-height-real: ${layout.headerHeight}px;
          --content-width: ${layout.contentWidth}px;
          --sidebar-width: ${layout.sidebarWidth}px;
          --page-width: ${layout.pageWidth != null
            ? `${layout.pageWidth}px`
            : "100vw"};
          --logo-height: ${layout.logoHeight}px;

          /* for backwards compatibility */
          --typography-body-font-family: var(--font-body);
          --typography-heading-font-family: var(--font-heading);
          --typography-code-font-family: var(--font-code);
        }

        ${root
          ? getColorScaleCss({
              mode: hasTheme ? "light" : "none",
              name: "accent",
              scale: root.accentScale,
              scaleWideGamut: root.accentScaleWideGamut,
              scaleAlpha: root.accentScaleAlpha,
              scaleAlphaWideGamut: root.accentScaleAlphaWideGamut,
              contrast: root.accentContrast,
              surface: root.accentSurface,
              surfaceWideGamut: root.accentSurfaceWideGamut,
            })
          : ""}

        ${root
          ? getColorScaleCss({
              mode: hasTheme ? "light" : "none",
              name: "grayscale",
              scale: root.grayScale,
              scaleWideGamut: root.grayScaleWideGamut,
              scaleAlpha: root.grayScaleAlpha,
              scaleAlphaWideGamut: root.grayScaleAlphaWideGamut,
              contrast: root.appearance === "light" ? "#000" : "#fff",
              surface: root.graySurface,
              surfaceWideGamut: root.graySurfaceWideGamut,
            })
          : ""}

        ${hasTheme && dark
          ? getColorScaleCss({
              mode: "dark",
              name: "accent",
              scale: dark.accentScale,
              scaleWideGamut: dark.accentScaleWideGamut,
              scaleAlpha: dark.accentScaleAlpha,
              scaleAlphaWideGamut: dark.accentScaleAlphaWideGamut,
              contrast: dark.accentContrast,
              surface: dark.accentSurface,
              surfaceWideGamut: dark.accentSurfaceWideGamut,
            })
          : ""}

        ${hasTheme && dark
          ? getColorScaleCss({
              mode: "dark",
              name: "grayscale",
              scale: dark.grayScale,
              scaleWideGamut: dark.grayScaleWideGamut,
              scaleAlpha: dark.grayScaleAlpha,
              scaleAlphaWideGamut: dark.grayScaleAlphaWideGamut,
              contrast: dark.appearance === "light" ? "#000" : "#fff",
              surface: dark.graySurface,
              surfaceWideGamut: dark.graySurfaceWideGamut,
            })
          : ""}

        ${hasTheme ? ":root, .light" : ":root"} {
          --accent: ${root?.accent ?? FERN_COLOR_ACCENT};
          --background: ${root?.background ?? (light ? "#fff" : "#000")};
          --border: ${domain.includes("nominal")
            ? "#000"
            : (root?.border ?? "initial")};
          --sidebar-background: ${root?.sidebarBackground ?? "initial"};
          --header-background: ${root?.headerBackground ?? "initial"};
          --card-background: ${root?.cardBackground ?? "initial"};
          --theme-color: ${root?.themeColor};
        }

        ${hasTheme && dark
          ? `.dark {
          --accent: ${dark?.accent ?? FERN_COLOR_ACCENT};
          --background: ${dark.background ?? "#000"};
          --border: ${
            domain.includes("nominal") ? "#fff" : (dark.border ?? "initial")
          };
          --sidebar-background: ${dark.sidebarBackground ?? "initial"};
          --header-background: ${dark.headerBackground ?? "initial"};
          --card-background: ${dark.cardBackground ?? "initial"};
          --theme-color: ${dark.themeColor};
        }`
          : ""}

        ${fonts.additionalCss}

        ${inlineCss.join("\n")}
      `}
    </style>
  );
}
const getColorScaleCss = ({
  mode,
  name,
  scale,
  scaleWideGamut,
  scaleAlpha,
  scaleAlphaWideGamut,
  contrast,
  surface,
  surfaceWideGamut,
}: {
  mode: "light" | "dark" | "none";
  name: string;
  scale: ArrayOf12<string>;
  scaleWideGamut: ArrayOf12<string>;
  scaleAlpha: ArrayOf12<string>;
  scaleAlphaWideGamut: ArrayOf12<string>;
  contrast: string;
  surface: string;
  surfaceWideGamut: string;
}) => {
  const selector =
    mode === "dark" ? ".dark" : mode === "light" ? ":root, .light" : ":root";

  return `
${selector} {
  ${scale.map((value, index) => `--${name}-${index + 1}: ${value};`).join("\n  ")}

  ${scaleAlpha.map((value, index) => `--${name}-a${index + 1}: ${value};`).join("\n  ")}

  --${name}-contrast: ${contrast};
  --${name}-surface: ${surface};
  --${name}-indicator: ${scale[8]};
  --${name}-track: ${scale[8]};
}

@supports (color: color(display-p3 1 1 1)) {
  @media (color-gamut: p3) {
    ${selector} {
      ${scaleWideGamut.map((value, index) => `--${name}-${index + 1}: ${value};`).join("\n      ")}

      ${scaleAlphaWideGamut
        .map((value, index) => `--${name}-a${index + 1}: ${value};`)
        .join("\n      ")}

      --${name}-contrast: ${contrast};
      --${name}-surface: ${surfaceWideGamut};
      --${name}-indicator: ${scaleWideGamut[8]};
      --${name}-track: ${scaleWideGamut[8]};
    }
  }
}
  `.trim();
};

function createFontFamilyCss(fontFamily: string | undefined, fallback: string) {
  return fontFamily ? `${fontFamily}, ${fallback}` : fallback;
}
