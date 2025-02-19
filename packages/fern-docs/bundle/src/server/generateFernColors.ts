import * as RadixColors from "@radix-ui/colors";
import Color from "colorjs.io";

import { FERN_COLOR_ACCENT } from "@fern-docs/utils";

import {
  ColorPalette,
  darkGrayColors,
  generateRadixColors,
  lightGrayColors,
} from "./generateRadixColors";

/**
 * the goal is to determine the closest grayscale color for the given background and accent
 */
export function getSourceForGrayscale({
  background,
  accent,
}: {
  background?: string;
  accent?: string;
}): string {
  if (!background && !accent) {
    return RadixColors.gray.gray6;
  }
  let source = RadixColors.gray.gray6;
  if (background && !isWhiteOrBlack(background)) {
    source = RadixColors.gray.gray12;
  } else if (accent) {
    source = accent;
  }

  return source;
}

function isWhiteOrBlack(color: string): boolean {
  return ["#ffffff", "#000000"].includes(
    new Color(color).to("srgb").toString({ format: "hex" }).toLowerCase()
  );
}

function getClosestGrayColor(source: string): string {
  try {
    const sourceColor = new Color(source).to("oklch");
    const scales = { ...lightGrayColors, ...darkGrayColors };
    const allColors: { scale: string; color: Color; distance: number }[] = [];

    Object.entries(scales).forEach(([name, scale]) => {
      for (const color of scale) {
        const distance = sourceColor.deltaE76(color);
        allColors.push({ scale: name, distance, color });
      }
    });

    allColors.sort((a, b) => a.distance - b.distance);

    return allColors[0]!.color.toString({ format: "hex" });
  } catch (e) {
    console.error(e);
    return RadixColors.gray.gray6;
  }
}

function generateColorPalette(opts: {
  appearance: "light" | "dark";
  accent: string;
  background?: string;
}): ColorPalette {
  const source = getSourceForGrayscale(opts);
  const gray = getClosestGrayColor(source);
  const accent = opts.accent;
  const background =
    opts.background ?? (opts.appearance === "light" ? "#ffffff" : "#000000");
  return generateRadixColors({
    appearance: opts.appearance,
    accent,
    background,
    gray,
  });
}

export interface FernColorPalette extends ColorPalette {
  border?: string;
  accent: string;
  sidebarBackground?: string;
  headerBackground?: string;
  cardBackground?: string;
}

export function generateFernColorPalette({
  appearance,
  background,
  // this is the default accent color (the fern logo color)
  accent = FERN_COLOR_ACCENT,
  border,
  sidebarBackground,
  headerBackground,
  cardBackground,
}: {
  appearance: "light" | "dark";
  background?: string;
  accent?: string;
  border?: string;
  sidebarBackground?: string;
  headerBackground?: string;
  cardBackground?: string;
}): FernColorPalette {
  return {
    ...generateColorPalette({ appearance, background, accent }),
    accent,
    border,
    sidebarBackground,
    headerBackground,
    cardBackground,
  };
}
