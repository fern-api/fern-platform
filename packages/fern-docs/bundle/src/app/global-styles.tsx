"use client";

import { FERN_COLOR_ACCENT } from "@fern-docs/utils";

import { FernFonts } from "@/server/generateFonts";
import { ArrayOf12 } from "@/server/generateRadixColors";
import { FernColorTheme, FernLayoutConfig } from "@/server/types";

const FONT_MONO =
  "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace";
const FONT_SANS =
  "ui-sans-serif, system-ui, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'";

// todo: remove domain-specific styling

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

  const fallbackDark = {
    appearance: "dark" as const,
    accentScale: Array(12).fill("#fff") as ArrayOf12<string>,
    accentScaleAlpha: Array(12).fill("#fff") as ArrayOf12<string>,
    accentScaleWideGamut: Array(12).fill(
      "oklch(100% 0 0)"
    ) as ArrayOf12<string>,
    accentScaleAlphaWideGamut: Array(12).fill(
      "oklch(100% 0 0)"
    ) as ArrayOf12<string>,
    accentContrast: "#000",
    grayScale: [
      "#000",
      "#111",
      "#222",
      "#333",
      "#444",
      "#555",
      "#666",
      "#777",
      "#888",
      "#999",
      "#aaa",
      "#bbb",
    ] as ArrayOf12<string>,
    grayScaleAlpha: [
      "#000",
      "#111",
      "#222",
      "#333",
      "#444",
      "#555",
      "#666",
      "#777",
      "#888",
      "#999",
      "#aaa",
      "#bbb",
    ] as ArrayOf12<string>,
    grayScaleWideGamut: [
      "oklch(0% 0 0)",
      "oklch(10% 0 0)",
      "oklch(20% 0 0)",
      "oklch(30% 0 0)",
      "oklch(40% 0 0)",
      "oklch(50% 0 0)",
      "oklch(60% 0 0)",
      "oklch(70% 0 0)",
      "oklch(80% 0 0)",
      "oklch(90% 0 0)",
      "oklch(95% 0 0)",
      "oklch(100% 0 0)",
    ] as ArrayOf12<string>,
    grayScaleAlphaWideGamut: [
      "oklch(0% 0 0)",
      "oklch(10% 0 0)",
      "oklch(20% 0 0)",
      "oklch(30% 0 0)",
      "oklch(40% 0 0)",
      "oklch(50% 0 0)",
      "oklch(60% 0 0)",
      "oklch(70% 0 0)",
      "oklch(80% 0 0)",
      "oklch(90% 0 0)",
      "oklch(95% 0 0)",
      "oklch(100% 0 0)",
    ] as ArrayOf12<string>,
    graySurface: "rgba(0, 0, 0, 0.05)",
    graySurfaceWideGamut: "color(display-p3 0 0 0 / 5%)",
    accentSurface: "#ffffff",
    accentSurfaceWideGamut: "color(display-p3 1 1 1)",
    background: "#000000",
  };
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
          --mobile-header-height-real: ${Math.min(layout.headerHeight, 64)}px;
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
          : getColorScaleCss({
              mode: "dark",
              name: "grayscale",
              scale: fallbackDark.grayScale,
              scaleWideGamut: fallbackDark.grayScaleWideGamut,
              scaleAlpha: fallbackDark.grayScaleAlpha,
              scaleAlphaWideGamut: fallbackDark.grayScaleAlphaWideGamut,
              contrast: "#fff",
              surface: fallbackDark.graySurface,
              surfaceWideGamut: fallbackDark.graySurfaceWideGamut,
            })}

        ${hasTheme ? ":root, .light" : ":root"} {
          --accent: ${root?.accent ?? FERN_COLOR_ACCENT};
          --background: ${root?.background ?? (light ? "#fff" : "#000")};
          --border: ${domain.includes("nominal")
            ? "#000"
            : (root?.border ?? "initial")};
          --sidebar-background: ${root?.sidebarBackground ?? "initial"};
          --header-background: ${root?.headerBackground ??
          "color-mix(in srgb, var(--background), transparent 30%)"};
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
          --header-background: ${dark.headerBackground ?? "color-mix(in srgb, var(--background), transparent 30%)"};
          --card-background: ${dark.cardBackground ?? "initial"};
          --theme-color: ${dark.themeColor};
        }`
          : `.dark { --background: #000;}`}

        ${root?.backgroundGradient || root?.backgroundImage
          ? `.fern-background-image {
          background-image: ${root?.backgroundImage?.src ? `url(${root?.backgroundImage?.src})` : light ? "linear-gradient(to bottom, color-mix(in srgb, var(--accent), var(--background) 90%) 0, var(--background) 100%)" : "linear-gradient(to bottom, var(--background) 0, color-mix(in srgb, var(--accent), var(--background) 90%) 100%)"};
        }`
          : ""}

      ${hasTheme && (light?.backgroundGradient || light?.backgroundImage)
          ? `.dark .fern-background-image {
          background-image: ${light?.backgroundImage?.src ? `url(${light?.backgroundImage?.src})` : "linear-gradient(to bottom, var(--background) 0, color-mix(in srgb, var(--accent), var(--background) 90%) 100%)"};
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
  console.log(scale, scaleWideGamut, scaleAlpha, scaleAlphaWideGamut);

  console.log(contrast, surface, surfaceWideGamut);

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
