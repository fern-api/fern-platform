import { ColorsThemeConfig } from "@/utils/types";
import type { DocsV1Read } from "@fern-api/fdr-sdk/client/types";
import tinycolor from "tinycolor2";
import {
  darkGrayColors,
  generateRadixColors,
  getClosestGrayScale,
  lightGrayColors,
} from "../../util/generateRadixColors";

interface ColorConfig {
  dark: DocsV1Read.RgbaColor;
  light: DocsV1Read.RgbaColor;
}

export const DEFAULT_COLORS: {
  accentPrimary: ColorConfig;
  background: ColorConfig;
} = {
  accentPrimary: {
    dark: {
      r: 129,
      g: 140,
      b: 248,
      a: 1,
    },
    light: {
      r: 129,
      g: 140,
      b: 248,
      a: 1,
    },
  },
  background: {
    dark: {
      r: 17,
      g: 20,
      b: 24,
      a: 1,
    },
    light: {
      r: 249,
      g: 250,
      b: 251,
      a: 1,
    },
  },
};

export const CSS_VARIABLES = {
  ACCENT_PRIMARY: "--accent",
  ACCENT_PRIMARY_AA: "--accent-aa",
  ACCENT_PRIMARY_AAA: "--accent-aaa",
  ACCENT_PRIMARY_TINTED: "--accent-tinted", // for hover state
  BACKGROUND: "--background",
  // contrast colors are useful for rendering text on top of where accent is the background color
  ACCENT_PRIMARY_CONTRAST: "--accent-contrast",
  CARD_BACKGROUND: "--bg-color-card",
  CARD_BACKGROUND_SOLID: "--bg-color-card-solid",
  SIDEBAR_BACKGROUND: "--sidebar-background",
  HEADER_BACKGROUND: "--header-background",
  BORDER: "--border",
  BORDER_CONCEALED: "--border-concealed",
  GRAYSCALE_1: "--grayscale-1",
  GRAYSCALE_2: "--grayscale-2",
  GRAYSCALE_3: "--grayscale-3",
  GRAYSCALE_4: "--grayscale-4",
  GRAYSCALE_5: "--grayscale-5",
  GRAYSCALE_6: "--grayscale-6",
  GRAYSCALE_7: "--grayscale-7",
  GRAYSCALE_8: "--grayscale-8",
  GRAYSCALE_9: "--grayscale-9",
  GRAYSCALE_10: "--grayscale-10",
  GRAYSCALE_11: "--grayscale-11",
  GRAYSCALE_12: "--grayscale-12",
  GRAYSCALE_A1: "--grayscale-a1",
  GRAYSCALE_A2: "--grayscale-a2",
  GRAYSCALE_A3: "--grayscale-a3",
  GRAYSCALE_A4: "--grayscale-a4",
  GRAYSCALE_A5: "--grayscale-a5",
  GRAYSCALE_A6: "--grayscale-a6",
  GRAYSCALE_A7: "--grayscale-a7",
  GRAYSCALE_A8: "--grayscale-a8",
  GRAYSCALE_A9: "--grayscale-a9",
  GRAYSCALE_A10: "--grayscale-a10",
  GRAYSCALE_A11: "--grayscale-a11",
  GRAYSCALE_A12: "--grayscale-a12",
  ACCENT_1: "--accent-1",
  ACCENT_2: "--accent-2",
  ACCENT_3: "--accent-3",
  ACCENT_4: "--accent-4",
  ACCENT_5: "--accent-5",
  ACCENT_6: "--accent-6",
  ACCENT_7: "--accent-7",
  ACCENT_8: "--accent-8",
  ACCENT_9: "--accent-9",
  ACCENT_10: "--accent-10",
  ACCENT_11: "--accent-11",
  ACCENT_12: "--accent-12",
  ACCENT_A1: "--accent-a1",
  ACCENT_A2: "--accent-a2",
  ACCENT_A3: "--accent-a3",
  ACCENT_A4: "--accent-a4",
  ACCENT_A5: "--accent-a5",
  ACCENT_A6: "--accent-a6",
  ACCENT_A7: "--accent-a7",
  ACCENT_A8: "--accent-a8",
  ACCENT_A9: "--accent-a9",
  ACCENT_A10: "--accent-a10",
  ACCENT_A11: "--accent-a11",
  ACCENT_A12: "--accent-a12",
  ACCENT_SURFACE: "--accent-surface",
  GRAY_SURFACE: "--gray-surface",
  BODY_TEXT: "--body-text",
  BODY_TEXT_INVERTED: "--body-text-inverted",
  BACKGROUND_IMAGE: "--docs-background-image",
} as const;

function isRgbColor(color: unknown): color is DocsV1Read.RgbaColor {
  if (typeof color !== "object" || color == null) {
    return false;
  }
  return "r" in color && "g" in color && "b" in color;
}

function getColor(
  colors: {
    light?: ColorsThemeConfig;
    dark?: ColorsThemeConfig;
  },
  key: "background" | "accentPrimary",
  theme: "light" | "dark"
): tinycolor.Instance {
  const color = colors[theme]?.[key];
  if (isRgbColor(color)) {
    return tinycolor({ r: color.r, g: color.g, b: color.b });
  } else {
    return tinycolor(DEFAULT_COLORS[key][theme]);
  }
}

function getColor2(
  colors: {
    light?: ColorsThemeConfig;
    dark?: ColorsThemeConfig;
  },
  key:
    | "background"
    | "accentPrimary"
    | "cardBackground"
    | "sidebarBackground"
    | "headerBackground"
    | "border",
  theme: "light" | "dark"
): tinycolor.Instance | undefined {
  const color = colors[theme]?.[key];
  if (isRgbColor(color)) {
    return tinycolor({ r: color.r, g: color.g, b: color.b });
  }
  return undefined;
}

export function getColorVariables(colors: {
  light?: ColorsThemeConfig;
  dark?: ColorsThemeConfig;
}): {
  light: Record<string, string | undefined>;
  dark: Record<string, string | undefined>;
} {
  const backgroundColorLight = enforceBackgroundTheme(
    getColor(colors, "background", "light"),
    "light"
  ).toRgb();
  const backgroundColorDark = enforceBackgroundTheme(
    getColor(colors, "background", "dark"),
    "dark"
  ).toRgb();
  const shouldUseAccentColorLight =
    !colors.light?.background ||
    tinycolor(backgroundColorLight).toHexString() === "#ffffff";
  const shouldUseAccentColorDark =
    !colors.dark?.background ||
    tinycolor(backgroundColorDark).toHexString() === "#000000";

  const accentPrimaryLightUi = increaseForegroundContrast(
    getColor(colors, "accentPrimary", "light"),
    tinycolor(backgroundColorLight),
    "ui"
  ).toRgb();
  const accentPrimaryDarkUi = increaseForegroundContrast(
    getColor(colors, "accentPrimary", "dark"),
    tinycolor(backgroundColorDark),
    "ui"
  ).toRgb();

  const radixGrayscaleLight = getClosestGrayScale(
    tinycolor(
      shouldUseAccentColorLight ? accentPrimaryLightUi : backgroundColorLight
    ).toHexString()
  );
  const radixGrayscaleDark = getClosestGrayScale(
    tinycolor(
      shouldUseAccentColorDark ? accentPrimaryDarkUi : backgroundColorDark
    ).toHexString()
  );

  const radixColorsLight = generateRadixColors({
    appearance: "light",
    accent: tinycolor(accentPrimaryLightUi).toHexString(),
    gray: lightGrayColors[radixGrayscaleLight][6].toString(),
    background: tinycolor(backgroundColorLight).toHexString(),
  });

  const radixColorsDark = generateRadixColors({
    appearance: "dark",
    accent: tinycolor(accentPrimaryDarkUi).toHexString(),
    gray: darkGrayColors[radixGrayscaleDark][6].toString(),
    background: tinycolor(backgroundColorDark).toHexString(),
  });

  const accentPrimaryLightContrast = tinycolor(
    radixColorsLight.accentContrast
  ).toRgb();
  const accentPrimaryDarkContrast = tinycolor(
    radixColorsDark.accentContrast
  ).toRgb();

  const accentPrimaryLightTinted = (
    tinycolor(accentPrimaryLightUi).isLight()
      ? tinycolor(accentPrimaryLightUi).lighten(5)
      : tinycolor(accentPrimaryLightUi).darken(5)
  ).toRgb();
  const accentPrimaryDarkTinted = (
    tinycolor(accentPrimaryDarkUi).isLight()
      ? tinycolor(accentPrimaryDarkUi).lighten(5)
      : tinycolor(accentPrimaryDarkUi).darken(5)
  ).toRgb();

  const accentPrimaryLightAA = increaseForegroundContrast(
    getColor(colors, "accentPrimary", "light"),
    tinycolor(backgroundColorLight),
    "aa"
  ).toRgb();
  const accentPrimaryDarkAA = increaseForegroundContrast(
    getColor(colors, "accentPrimary", "dark"),
    tinycolor(backgroundColorDark),
    "aa"
  ).toRgb();

  const accentPrimaryLightAAA = increaseForegroundContrast(
    getColor(colors, "accentPrimary", "light"),
    tinycolor(backgroundColorLight),
    "aaa"
  ).toRgb();
  const accentPrimaryDarkAAA = increaseForegroundContrast(
    getColor(colors, "accentPrimary", "dark"),
    tinycolor(backgroundColorDark),
    "aaa"
  ).toRgb();

  const cardBackgroundLight = getColor2(colors, "cardBackground", "light");
  const cardBackgroundDark = getColor2(colors, "cardBackground", "dark");
  const sidebarBackgroundLight = getColor2(
    colors,
    "sidebarBackground",
    "light"
  );
  const sidebarBackgroundDark = getColor2(colors, "sidebarBackground", "dark");
  const headerBackgroundLight = getColor2(colors, "headerBackground", "light");
  const headerBackgroundDark = getColor2(colors, "headerBackground", "dark");
  const borderLight = getColor2(colors, "border", "light");
  const borderDark = getColor2(colors, "border", "dark");

  return {
    light: {
      [CSS_VARIABLES.GRAYSCALE_1]: getRadixGrayVar(radixGrayscaleLight, 1),
      [CSS_VARIABLES.GRAYSCALE_2]: getRadixGrayVar(radixGrayscaleLight, 2),
      [CSS_VARIABLES.GRAYSCALE_3]: getRadixGrayVar(radixGrayscaleLight, 3),
      [CSS_VARIABLES.GRAYSCALE_4]: getRadixGrayVar(radixGrayscaleLight, 4),
      [CSS_VARIABLES.GRAYSCALE_5]: getRadixGrayVar(radixGrayscaleLight, 5),
      [CSS_VARIABLES.GRAYSCALE_6]: getRadixGrayVar(radixGrayscaleLight, 6),
      [CSS_VARIABLES.GRAYSCALE_7]: getRadixGrayVar(radixGrayscaleLight, 7),
      [CSS_VARIABLES.GRAYSCALE_8]: getRadixGrayVar(radixGrayscaleLight, 8),
      [CSS_VARIABLES.GRAYSCALE_9]: getRadixGrayVar(radixGrayscaleLight, 9),
      [CSS_VARIABLES.GRAYSCALE_10]: getRadixGrayVar(radixGrayscaleLight, 10),
      [CSS_VARIABLES.GRAYSCALE_11]: getRadixGrayVar(radixGrayscaleLight, 11),
      [CSS_VARIABLES.GRAYSCALE_12]: getRadixGrayVar(radixGrayscaleLight, 12),
      [CSS_VARIABLES.GRAYSCALE_A1]: getRadixGrayAlphaVar(
        radixGrayscaleLight,
        1
      ),
      [CSS_VARIABLES.GRAYSCALE_A2]: getRadixGrayAlphaVar(
        radixGrayscaleLight,
        2
      ),
      [CSS_VARIABLES.GRAYSCALE_A3]: getRadixGrayAlphaVar(
        radixGrayscaleLight,
        3
      ),
      [CSS_VARIABLES.GRAYSCALE_A4]: getRadixGrayAlphaVar(
        radixGrayscaleLight,
        4
      ),
      [CSS_VARIABLES.GRAYSCALE_A5]: getRadixGrayAlphaVar(
        radixGrayscaleLight,
        5
      ),
      [CSS_VARIABLES.GRAYSCALE_A6]: getRadixGrayAlphaVar(
        radixGrayscaleLight,
        6
      ),
      [CSS_VARIABLES.GRAYSCALE_A7]: getRadixGrayAlphaVar(
        radixGrayscaleLight,
        7
      ),
      [CSS_VARIABLES.GRAYSCALE_A8]: getRadixGrayAlphaVar(
        radixGrayscaleLight,
        8
      ),
      [CSS_VARIABLES.GRAYSCALE_A9]: getRadixGrayAlphaVar(
        radixGrayscaleLight,
        9
      ),
      [CSS_VARIABLES.GRAYSCALE_A10]: getRadixGrayAlphaVar(
        radixGrayscaleLight,
        10
      ),
      [CSS_VARIABLES.GRAYSCALE_A11]: getRadixGrayAlphaVar(
        radixGrayscaleLight,
        11
      ),
      [CSS_VARIABLES.GRAYSCALE_A12]: getRadixGrayAlphaVar(
        radixGrayscaleLight,
        12
      ),
      [CSS_VARIABLES.ACCENT_1]: radixColorsLight.accentScale[0],
      [CSS_VARIABLES.ACCENT_2]: radixColorsLight.accentScale[1],
      [CSS_VARIABLES.ACCENT_3]: radixColorsLight.accentScale[2],
      [CSS_VARIABLES.ACCENT_4]: radixColorsLight.accentScale[3],
      [CSS_VARIABLES.ACCENT_5]: radixColorsLight.accentScale[4],
      [CSS_VARIABLES.ACCENT_6]: radixColorsLight.accentScale[5],
      [CSS_VARIABLES.ACCENT_7]: radixColorsLight.accentScale[6],
      [CSS_VARIABLES.ACCENT_8]: radixColorsLight.accentScale[7],
      [CSS_VARIABLES.ACCENT_9]: radixColorsLight.accentScale[8],
      [CSS_VARIABLES.ACCENT_10]: radixColorsLight.accentScale[9],
      [CSS_VARIABLES.ACCENT_11]: radixColorsLight.accentScale[10],
      [CSS_VARIABLES.ACCENT_12]: radixColorsLight.accentScale[11],
      [CSS_VARIABLES.ACCENT_A1]: radixColorsLight.accentScaleAlpha[0],
      [CSS_VARIABLES.ACCENT_A2]: radixColorsLight.accentScaleAlpha[1],
      [CSS_VARIABLES.ACCENT_A3]: radixColorsLight.accentScaleAlpha[2],
      [CSS_VARIABLES.ACCENT_A4]: radixColorsLight.accentScaleAlpha[3],
      [CSS_VARIABLES.ACCENT_A5]: radixColorsLight.accentScaleAlpha[4],
      [CSS_VARIABLES.ACCENT_A6]: radixColorsLight.accentScaleAlpha[5],
      [CSS_VARIABLES.ACCENT_A7]: radixColorsLight.accentScaleAlpha[6],
      [CSS_VARIABLES.ACCENT_A8]: radixColorsLight.accentScaleAlpha[7],
      [CSS_VARIABLES.ACCENT_A9]: radixColorsLight.accentScaleAlpha[8],
      [CSS_VARIABLES.ACCENT_A10]: radixColorsLight.accentScaleAlpha[9],
      [CSS_VARIABLES.ACCENT_A11]: radixColorsLight.accentScaleAlpha[10],
      [CSS_VARIABLES.ACCENT_A12]: radixColorsLight.accentScaleAlpha[11],
      [CSS_VARIABLES.ACCENT_SURFACE]: radixColorsLight.accentSurface,
      [CSS_VARIABLES.GRAY_SURFACE]: radixColorsLight.graySurface,

      [CSS_VARIABLES.ACCENT_PRIMARY]: `${accentPrimaryLightUi.r}, ${accentPrimaryLightUi.g}, ${accentPrimaryLightUi.b}`,
      [CSS_VARIABLES.ACCENT_PRIMARY_AA]: `${accentPrimaryLightAA.r}, ${accentPrimaryLightAA.g}, ${accentPrimaryLightAA.b}`,
      [CSS_VARIABLES.ACCENT_PRIMARY_AAA]: `${accentPrimaryLightAAA.r}, ${accentPrimaryLightAAA.g}, ${accentPrimaryLightAAA.b}`,
      [CSS_VARIABLES.ACCENT_PRIMARY_TINTED]: `${accentPrimaryLightTinted.r}, ${accentPrimaryLightTinted.g}, ${accentPrimaryLightTinted.b}`,
      [CSS_VARIABLES.BACKGROUND]: `${backgroundColorLight.r}, ${backgroundColorLight.g}, ${backgroundColorLight.b}`,
      [CSS_VARIABLES.ACCENT_PRIMARY_CONTRAST]: `rgb(${accentPrimaryLightContrast.r}, ${accentPrimaryLightContrast.g}, ${accentPrimaryLightContrast.b})`,
      [CSS_VARIABLES.CARD_BACKGROUND]:
        cardBackgroundLight?.toRgbString() ??
        tinycolor("white").setAlpha(0.7).toRgbString(),
      [CSS_VARIABLES.SIDEBAR_BACKGROUND]:
        sidebarBackgroundLight?.toRgbString() ?? "transparent",
      [CSS_VARIABLES.HEADER_BACKGROUND]:
        headerBackgroundLight?.toRgbString() ?? "transparent",
      [CSS_VARIABLES.BORDER]:
        borderLight?.toRgbString() ?? "var(--grayscale-a4)",
      [CSS_VARIABLES.BORDER_CONCEALED]:
        borderLight?.toRgbString() ?? "var(--grayscale-a2)",
      [CSS_VARIABLES.BODY_TEXT]: "0, 0, 0",
      [CSS_VARIABLES.BODY_TEXT_INVERTED]: "255, 255, 255",
      [CSS_VARIABLES.BACKGROUND_IMAGE]: !!colors.light?.backgroundImage?.url
        ? `url(${colors.light.backgroundImage.url})`
        : undefined,
    },
    dark: {
      [CSS_VARIABLES.GRAYSCALE_1]: getRadixGrayVar(radixGrayscaleDark, 1),
      [CSS_VARIABLES.GRAYSCALE_2]: getRadixGrayVar(radixGrayscaleDark, 2),
      [CSS_VARIABLES.GRAYSCALE_3]: getRadixGrayVar(radixGrayscaleDark, 3),
      [CSS_VARIABLES.GRAYSCALE_4]: getRadixGrayVar(radixGrayscaleDark, 4),
      [CSS_VARIABLES.GRAYSCALE_5]: getRadixGrayVar(radixGrayscaleDark, 5),
      [CSS_VARIABLES.GRAYSCALE_6]: getRadixGrayVar(radixGrayscaleDark, 6),
      [CSS_VARIABLES.GRAYSCALE_7]: getRadixGrayVar(radixGrayscaleDark, 7),
      [CSS_VARIABLES.GRAYSCALE_8]: getRadixGrayVar(radixGrayscaleDark, 8),
      [CSS_VARIABLES.GRAYSCALE_9]: getRadixGrayVar(radixGrayscaleDark, 9),
      [CSS_VARIABLES.GRAYSCALE_10]: getRadixGrayVar(radixGrayscaleDark, 10),
      [CSS_VARIABLES.GRAYSCALE_11]: getRadixGrayVar(radixGrayscaleDark, 11),
      [CSS_VARIABLES.GRAYSCALE_12]: getRadixGrayVar(radixGrayscaleDark, 12),
      [CSS_VARIABLES.GRAYSCALE_A1]: getRadixGrayAlphaVar(radixGrayscaleDark, 1),
      [CSS_VARIABLES.GRAYSCALE_A2]: getRadixGrayAlphaVar(radixGrayscaleDark, 2),
      [CSS_VARIABLES.GRAYSCALE_A3]: getRadixGrayAlphaVar(radixGrayscaleDark, 3),
      [CSS_VARIABLES.GRAYSCALE_A4]: getRadixGrayAlphaVar(radixGrayscaleDark, 4),
      [CSS_VARIABLES.GRAYSCALE_A5]: getRadixGrayAlphaVar(radixGrayscaleDark, 5),
      [CSS_VARIABLES.GRAYSCALE_A6]: getRadixGrayAlphaVar(radixGrayscaleDark, 6),
      [CSS_VARIABLES.GRAYSCALE_A7]: getRadixGrayAlphaVar(radixGrayscaleDark, 7),
      [CSS_VARIABLES.GRAYSCALE_A8]: getRadixGrayAlphaVar(radixGrayscaleDark, 8),
      [CSS_VARIABLES.GRAYSCALE_A9]: getRadixGrayAlphaVar(radixGrayscaleDark, 9),
      [CSS_VARIABLES.GRAYSCALE_A10]: getRadixGrayAlphaVar(
        radixGrayscaleDark,
        10
      ),
      [CSS_VARIABLES.GRAYSCALE_A11]: getRadixGrayAlphaVar(
        radixGrayscaleDark,
        11
      ),
      [CSS_VARIABLES.GRAYSCALE_A12]: getRadixGrayAlphaVar(
        radixGrayscaleDark,
        12
      ),
      [CSS_VARIABLES.ACCENT_1]: radixColorsDark.accentScale[0],
      [CSS_VARIABLES.ACCENT_2]: radixColorsDark.accentScale[1],
      [CSS_VARIABLES.ACCENT_3]: radixColorsDark.accentScale[2],
      [CSS_VARIABLES.ACCENT_4]: radixColorsDark.accentScale[3],
      [CSS_VARIABLES.ACCENT_5]: radixColorsDark.accentScale[4],
      [CSS_VARIABLES.ACCENT_6]: radixColorsDark.accentScale[5],
      [CSS_VARIABLES.ACCENT_7]: radixColorsDark.accentScale[6],
      [CSS_VARIABLES.ACCENT_8]: radixColorsDark.accentScale[7],
      [CSS_VARIABLES.ACCENT_9]: radixColorsDark.accentScale[8],
      [CSS_VARIABLES.ACCENT_10]: radixColorsDark.accentScale[9],
      [CSS_VARIABLES.ACCENT_11]: radixColorsDark.accentScale[10],
      [CSS_VARIABLES.ACCENT_12]: radixColorsDark.accentScale[11],
      [CSS_VARIABLES.ACCENT_A1]: radixColorsDark.accentScaleAlpha[0],
      [CSS_VARIABLES.ACCENT_A2]: radixColorsDark.accentScaleAlpha[1],
      [CSS_VARIABLES.ACCENT_A3]: radixColorsDark.accentScaleAlpha[2],
      [CSS_VARIABLES.ACCENT_A4]: radixColorsDark.accentScaleAlpha[3],
      [CSS_VARIABLES.ACCENT_A5]: radixColorsDark.accentScaleAlpha[4],
      [CSS_VARIABLES.ACCENT_A6]: radixColorsDark.accentScaleAlpha[5],
      [CSS_VARIABLES.ACCENT_A7]: radixColorsDark.accentScaleAlpha[6],
      [CSS_VARIABLES.ACCENT_A8]: radixColorsDark.accentScaleAlpha[7],
      [CSS_VARIABLES.ACCENT_A9]: radixColorsDark.accentScaleAlpha[8],
      [CSS_VARIABLES.ACCENT_A10]: radixColorsDark.accentScaleAlpha[9],
      [CSS_VARIABLES.ACCENT_A11]: radixColorsDark.accentScaleAlpha[10],
      [CSS_VARIABLES.ACCENT_A12]: radixColorsDark.accentScaleAlpha[11],
      [CSS_VARIABLES.ACCENT_SURFACE]: radixColorsDark.accentSurfaceWideGamut,
      [CSS_VARIABLES.GRAY_SURFACE]: radixColorsDark.graySurfaceWideGamut,

      [CSS_VARIABLES.ACCENT_PRIMARY]: `${accentPrimaryDarkUi.r}, ${accentPrimaryDarkUi.g}, ${accentPrimaryDarkUi.b}`,
      [CSS_VARIABLES.ACCENT_PRIMARY_AA]: `${accentPrimaryDarkAA.r}, ${accentPrimaryDarkAA.g}, ${accentPrimaryDarkAA.b}`,
      [CSS_VARIABLES.ACCENT_PRIMARY_AAA]: `${accentPrimaryDarkAAA.r}, ${accentPrimaryDarkAAA.g}, ${accentPrimaryDarkAAA.b}`,
      [CSS_VARIABLES.ACCENT_PRIMARY_TINTED]: `${accentPrimaryDarkTinted.r}, ${accentPrimaryDarkTinted.g}, ${accentPrimaryDarkTinted.b}`,
      [CSS_VARIABLES.BACKGROUND]: `${backgroundColorDark.r}, ${backgroundColorDark.g}, ${backgroundColorDark.b}`,
      [CSS_VARIABLES.ACCENT_PRIMARY_CONTRAST]: `rgb(${accentPrimaryDarkContrast.r}, ${accentPrimaryDarkContrast.g}, ${accentPrimaryDarkContrast.b})`,
      [CSS_VARIABLES.CARD_BACKGROUND]:
        cardBackgroundDark?.toRgbString() ??
        tinycolor(backgroundColorDark).darken(2).setAlpha(0.5).toRgbString(),
      [CSS_VARIABLES.CARD_BACKGROUND_SOLID]:
        cardBackgroundDark?.toRgbString() ??
        tinycolor(backgroundColorDark).darken(1).toRgbString(),
      [CSS_VARIABLES.SIDEBAR_BACKGROUND]:
        sidebarBackgroundDark?.toRgbString() ?? "transparent",
      [CSS_VARIABLES.HEADER_BACKGROUND]:
        headerBackgroundDark?.toRgbString() ?? "transparent",
      [CSS_VARIABLES.BORDER]:
        borderDark?.toRgbString() ?? "var(--grayscale-a4)",
      [CSS_VARIABLES.BORDER_CONCEALED]:
        borderDark?.toRgbString() ?? "var(--grayscale-a2)",
      [CSS_VARIABLES.BODY_TEXT]: "255, 255, 255",
      [CSS_VARIABLES.BODY_TEXT_INVERTED]: "0, 0, 0",
      [CSS_VARIABLES.BACKGROUND_IMAGE]: !!colors.dark?.backgroundImage?.url
        ? `url(${colors.dark.backgroundImage.url})`
        : undefined,
    },
  };
}

export function increaseForegroundContrast(
  foregroundColor: tinycolor.Instance,
  backgroundColor: tinycolor.Instance,
  ratio: "aaa" | "aa" | "ui"
): tinycolor.Instance {
  let newForgroundColor = foregroundColor;
  const dark = backgroundColor.isDark();
  const desiredRatio = ratio === "aa" ? 4.5 : ratio === "aaa" ? 7 : 3;
  while (
    tinycolor.readability(newForgroundColor, backgroundColor) < desiredRatio
  ) {
    if (
      dark
        ? newForgroundColor.getBrightness() === 255
        : newForgroundColor.getBrightness() === 0
    ) {
      // if the color is already at its maximum or minimum brightness, stop adjusting
      break;
    }
    // if the accent color is still not readable, adjust it by 1% until it is
    // if the theme is dark, lighten the color, otherwise darken it
    newForgroundColor = dark
      ? newForgroundColor.lighten(1)
      : newForgroundColor.darken(1);
  }
  return newForgroundColor;
}

export function enforceBackgroundTheme(
  color: tinycolor.Instance,
  theme: "dark" | "light"
): tinycolor.Instance {
  if (theme === "dark" && color.isDark()) {
    return color;
  } else if (theme === "light" && color.isLight()) {
    return color;
  }

  return getOppositeBrightness(color);
}

function getOppositeBrightness(color: tinycolor.Instance): tinycolor.Instance;
function getOppositeBrightness(
  color: tinycolor.Instance | undefined
): tinycolor.Instance | undefined;
function getOppositeBrightness(
  color: tinycolor.Instance | undefined
): tinycolor.Instance | undefined {
  if (color == null) {
    return undefined;
  }

  const { h, s, v } = color.toHsv();
  return tinycolor({ h, s, v: 1 - v });
}

type RadixGray = "gray" | "mauve" | "slate" | "sage" | "olive" | "sand";

function getRadixGrayAlphaVar(gray: RadixGray, scale: number): string {
  return `var(--${gray}-a${scale})`;
}

function getRadixGrayVar(gray: RadixGray, scale: number): string {
  return `var(--${gray}-${scale})`;
}

export function getThemeColor(config: DocsV1Read.ThemeConfig): string {
  const color =
    config.headerBackground ??
    (config.background.type === "solid" ? config.background : undefined);
  if (color != null) {
    return tinycolor(color).toHexString();
  }

  return tinycolor(config.accentPrimary).toHexString();
}
