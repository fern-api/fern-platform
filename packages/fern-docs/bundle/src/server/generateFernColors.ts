import * as RadixColors from "@radix-ui/colors";
import Color from "colorjs.io";

import { FERN_COLOR_ACCENT } from "@fern-docs/utils";

import {
  ArrayOf12,
  ColorPalette,
  darkGrayColors,
  generateRadixColors,
  getAlphaColorP3,
  getAlphaColorSrgb,
  lightGrayColors,
  toOklchString,
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
  const shouldUseAccentColor =
    accent != null && (!background || isWhiteOrBlack(background));

  return (
    (shouldUseAccentColor ? accent : background) ?? RadixColors.gray.gray12
  );
}

function isWhiteOrBlack(color: string): boolean {
  return ["#fff", "#000", "#ffffff", "#000000"].includes(
    new Color(color).to("srgb").toString({ format: "hex" }).toLowerCase()
  );
}

type GrayScale = keyof typeof lightGrayColors | keyof typeof darkGrayColors;

function getClosestGrayColor(source: string): GrayScale {
  try {
    const sourceColor = new Color(source).to("oklch");
    const allColors: { scale: string; color: Color; distance: number }[] = [];

    [
      ...Object.entries(lightGrayColors),
      ...Object.entries(darkGrayColors),
    ].forEach(([name, scale]) => {
      for (const color of scale) {
        const distance = sourceColor.deltaE76(color);
        allColors.push({ scale: name, distance, color });
      }
    });

    allColors.sort((a, b) => a.distance - b.distance);

    const closestColor = allColors[0]!;
    return closestColor.scale as GrayScale;
  } catch (e) {
    console.error(e);
    return "gray";
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
  const grayColors =
    opts.appearance === "light" ? lightGrayColors : darkGrayColors;
  const grayScale = grayColors[gray];
  const palette = generateRadixColors({
    appearance: opts.appearance,
    accent,
    background,
    gray: grayScale[11].toString()!,
  });
  return {
    ...palette,
    grayScale: grayScale.map((color) =>
      color.to("srgb").toString()
    ) as ArrayOf12<string>,
    grayScaleAlpha: grayScale.map((color) =>
      getAlphaColorSrgb(color.to("srgb").toString(), background)
    ) as ArrayOf12<string>,
    grayScaleWideGamut: grayScale.map(toOklchString) as ArrayOf12<string>,
    grayScaleAlphaWideGamut: grayScale.map((color) =>
      getAlphaColorP3(color.to("p3").toString(), background)
    ) as ArrayOf12<string>,
  };
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
  const palette = generateColorPalette({ appearance, background, accent });
  return {
    ...palette,
    accent,
    border,
    sidebarBackground,
    headerBackground,
    cardBackground,
  };
}
