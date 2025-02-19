"use client";

import { FernColorTheme } from "@/server/types";

export function GlobalStyles({
  children,
  domain,
  layout,
  light,
  dark,
}: {
  children: string;
  domain: string;
  layout: {
    logoHeight: number;
    sidebarWidth: number;
    headerHeight: number;
    pageWidth: number | undefined;
    contentWidth: number;
    tabsPlacement: "SIDEBAR" | "HEADER";
    searchbarPlacement: "SIDEBAR" | "HEADER" | "HEADER_TABS";
  };
  light?: FernColorTheme;
  dark?: FernColorTheme;
}) {
  const root = light ?? dark;
  return (
    <style jsx global>
      {`
        :root,
        .light,
        .light-theme${!light ? ", .dark, .dark-theme" : ""} {
          ${domain.includes("nominal") ? "--radius: 0px;" : ""}
          ${layout.headerHeight
            ? `--header-height-real: ${layout.headerHeight}px;`
            : ""}
          --background: ${root?.background ?? "initial"};
          --border-color: ${domain.includes("nominal")
            ? "#000"
            : (root?.border ?? "initial")};
          --sidebar-background: ${root?.sidebarBackground ?? "initial"};
          --header-background: ${root?.headerBackground ?? "initial"};
          --card-background: ${root?.cardBackground ?? "initial"};
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
          --border-color: ${
            domain.includes("nominal") ? "#fff" : (dark?.border ?? "initial")
          };
          --sidebar-background: ${dark?.sidebarBackground ?? "initial"};
          --header-background: ${dark?.headerBackground ?? "initial"};
          --card-background: ${dark?.cardBackground ?? "initial"};
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

        ${children}
      `}
    </style>
  );
}
