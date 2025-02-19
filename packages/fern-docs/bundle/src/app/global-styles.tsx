"use client";

import { FernFonts } from "@/server/generateFonts";
import { ArrayOf12 } from "@/server/generateRadixColors";
import { FernColorTheme, FernLayoutConfig } from "@/server/types";

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
  return (
    <style jsx global>
      {`
        ${fonts.fontFaces.join("\n        ")}

        :root {
          --font-body: ${fonts.bodyFont ?? "initial"};
          --font-heading: ${fonts.headingFont ?? "initial"};
          --font-code: ${fonts.codeFont ?? "initial"};
          ${domain.includes("nominal") ? "--radius: 0px;" : ""}
          --header-height-real: ${layout.headerHeight}px;
          --content-width: ${layout.contentWidth}px;
          --sidebar-width: ${layout.sidebarWidth}px;
          --page-width: ${layout.pageWidth != null
            ? `${layout.pageWidth}px`
            : "100vw"};
          --logo-height: ${layout.logoHeight}px;
        }

        :root,
        .light,
        .light-theme${!light ? ", .dark, .dark-theme" : ""} {
          --background: ${root?.background ?? "initial"};
          --border: ${domain.includes("nominal")
            ? "#000"
            : (root?.border ?? "initial")};
          --sidebar-background: ${root?.sidebarBackground ?? "initial"};
          --header-background: ${root?.headerBackground ?? "initial"};
          --card-background: ${root?.cardBackground ?? "initial"};
          --accent: ${root?.accent ?? "initial"};
          --accent-contrast: ${root?.accentContrast ?? "initial"};
          --accent-surface: ${root?.accentSurface ?? "initial"};
          --grayscale-surface: ${root?.graySurface ?? "initial"};
          ${generateColorVariables("accent", root?.accentScale)}
          ${generateColorVariables("accent", root?.accentScaleAlpha, true)}
          ${generateColorVariables("grayscale", root?.grayScale)}
          ${generateColorVariables("grayscale", root?.grayScaleAlpha, true)}
        }

        @supports (color: color(display-p3 1 1 1)) {
          @media (color-gamut: p3) {
            :root,
            .light,
            .light-theme${!light ? ", .dark, .dark-theme" : ""} {
              --accent-surface: ${root?.accentSurfaceWideGamut ?? "initial"};
              --grayscale-surface: ${root?.graySurfaceWideGamut ?? "initial"};
              ${generateColorVariables("accent", root?.accentScaleWideGamut)}
              ${generateColorVariables(
                "accent",
                root?.accentScaleAlphaWideGamut,
                true
              )}
              ${generateColorVariables("grayscale", root?.grayScaleWideGamut)}
              ${generateColorVariables(
                "grayscale",
                root?.grayScaleAlphaWideGamut,
                true
              )}
            }
          }
        }

        ${light && dark
          ? `.dark, .dark-theme {
          --background: ${dark?.background ?? "initial"};
          --border: ${
            domain.includes("nominal") ? "#fff" : (dark?.border ?? "initial")
          };
          --sidebar-background: ${dark?.sidebarBackground ?? "initial"};
          --header-background: ${dark?.headerBackground ?? "initial"};
          --card-background: ${dark?.cardBackground ?? "initial"};
          --accent: ${dark?.accent ?? "initial"};
          --accent-contrast: ${dark?.accentContrast ?? "initial"};
          --accent-surface: ${dark?.accentSurface ?? "initial"};
          --grayscale-surface: ${dark?.graySurface ?? "initial"};
          ${generateColorVariables("accent", dark?.accentScale)}
          ${generateColorVariables("accent", dark?.accentScaleAlpha, true)}
          ${generateColorVariables("grayscale", dark?.grayScale)}
          ${generateColorVariables("grayscale", dark?.grayScaleAlpha, true)}
        }
          
        @supports (color: color(display-p3 1 1 1)) {
          @media (color-gamut: p3) {
            .dark, .dark-theme {
              --accent-surface: ${dark?.accentSurfaceWideGamut ?? "initial"};
              --grayscale-surface: ${dark?.graySurfaceWideGamut ?? "initial"};
              ${generateColorVariables("accent", dark?.accentScaleWideGamut)}
              ${generateColorVariables(
                "accent",
                dark?.accentScaleAlphaWideGamut,
                true
              )}
              ${generateColorVariables("grayscale", dark?.grayScaleWideGamut)}
              ${generateColorVariables(
                "grayscale",
                dark?.grayScaleAlphaWideGamut,
                true
              )}
            }
          }`
          : ""}

        html {
          background-color: var(--background);
        }

        ${fonts.additionalCss}

        ${inlineCss.join("\n")}
      `}
    </style>
  );
}

function generateColorVariables(
  prefix: string,
  colors?: ArrayOf12<string>,
  alpha = false
) {
  return (
    colors
      ?.map((color, index) => {
        return `--${prefix}-${alpha ? "a" : ""}${index + 1}: ${color};`;
      })
      .join("\n") ?? ""
  );
}
