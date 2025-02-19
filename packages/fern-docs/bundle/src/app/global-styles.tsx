"use client";

import { FernFonts } from "@/server/generateFonts";
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
          ${domain.includes("nominal") ? "--border-radius: 0px;" : ""}
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
          ${root?.accentScale
            .map((color, index) => `--accent-${index + 1}: ${color};`)
            .join("\n          ") ?? ""}
          ${root?.accentScaleAlpha
            .map((color, index) => `--accent-a${index + 1}: ${color};`)
            .join("\n          ") ?? ""}
          ${root?.grayScale
            .map((color, index) => `--grayscale-${index + 1}: ${color};`)
            .join("\n          ") ?? ""}
          ${root?.grayScaleAlpha
            .map((color, index) => `--grayscale-a${index + 1}: ${color};`)
            .join("\n          ") ?? ""}
        }

        @supports (color: color(display-p3 1 1 1)) {
          @media (color-gamut: p3) {
            :root,
            .light,
            .light-theme${!light ? ", .dark, .dark-theme" : ""} {
              --accent-surface: ${root?.accentSurfaceWideGamut ?? "initial"};
              --grayscale-surface: ${root?.graySurfaceWideGamut ?? "initial"};
              ${root?.accentScaleWideGamut
                .map((color, index) => `--accent-${index + 1}: ${color};`)
                .join("\n              ") ?? ""}
              ${root?.accentScaleAlphaWideGamut
                .map((color, index) => `--accent-a${index + 1}: ${color};`)
                .join("\n              ") ?? ""}
              ${root?.grayScaleWideGamut
                .map((color, index) => `--grayscale-${index + 1}: ${color};`)
                .join("\n              ") ?? ""}
              ${root?.grayScaleAlphaWideGamut
                .map((color, index) => `--grayscale-a${index + 1}: ${color};`)
                .join("\n              ") ?? ""}
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
          ${
            dark?.accentScale
              .map((color, index) => `--accent-${index + 1}: ${color};`)
              .join("\n          ") ?? ""
          }
          ${
            dark?.accentScaleAlpha
              .map((color, index) => `--accent-a${index + 1}: ${color};`)
              .join("\n          ") ?? ""
          }
          ${
            dark?.grayScale
              .map((color, index) => `--grayscale-${index + 1}: ${color};`)
              .join("\n          ") ?? ""
          }
          ${
            dark?.grayScaleAlpha
              .map((color, index) => `--grayscale-a${index + 1}: ${color};`)
              .join("\n          ") ?? ""
          }
        }
          
        @supports (color: color(display-p3 1 1 1)) {
          @media (color-gamut: p3) {
            .dark, .dark-theme {
              --accent-surface: ${dark?.accentSurfaceWideGamut ?? "initial"};
              --grayscale-surface: ${dark?.graySurfaceWideGamut ?? "initial"};
              ${
                dark?.accentScaleWideGamut
                  .map((color, index) => `--accent-${index + 1}: ${color};`)
                  .join("\n              ") ?? ""
              }
              ${
                dark?.accentScaleAlphaWideGamut
                  .map((color, index) => `--accent-a${index + 1}: ${color};`)
                  .join("\n              ") ?? ""
              }
              ${
                dark?.grayScaleWideGamut
                  .map((color, index) => `--grayscale-${index + 1}: ${color};`)
                  .join("\n              ") ?? ""
              }
              ${
                dark?.grayScaleAlphaWideGamut
                  .map((color, index) => `--grayscale-a${index + 1}: ${color};`)
                  .join("\n              ") ?? ""
              }
            }
          }`
          : ""}

        html {
          background-color: var(--background);
        }

        ${fonts.additionalCss}

        ${inlineCss.join("\n        ")}
      `}
    </style>
  );
}
