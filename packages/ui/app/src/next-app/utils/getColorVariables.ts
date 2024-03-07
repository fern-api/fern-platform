import { DocsV1Read } from "@fern-api/fdr-sdk";
import { gray, mauve, olive, sage, sand, slate } from "@radix-ui/colors";
import tinycolor from "tinycolor2";
import { ColorsConfig } from "../../sidebar/types";

interface ColorConfig {
    dark: DocsV1Read.RgbaColor;
    light: DocsV1Read.RgbaColor;
}

const DEFAULT_COLORS: {
    accentPrimary: ColorConfig;
    background: ColorConfig;
} = {
    accentPrimary: {
        dark: {
            r: 129,
            g: 140,
            b: 248,
        },
        light: {
            r: 129,
            g: 140,
            b: 248,
        },
    },
    background: {
        dark: {
            r: 17,
            g: 20,
            b: 24,
        },
        light: {
            r: 249,
            g: 250,
            b: 251,
        },
    },
};

export const CSS_VARIABLES = {
    ACCENT_PRIMARY: "--accent-primary",
    ACCENT_PRIMARY_AA: "--accent-primary-aa",
    ACCENT_PRIMARY_AAA: "--accent-primary-aaa",
    ACCENT_PRIMARY_TINTED: "--accent-primary-tinted", // for hover state
    BACKGROUND: "--background",
    // contrast colors are useful for rendering text on top of where accent is the background color
    ACCENT_PRIMARY_CONTRAST: "--accent-primary-contrast",
    CARD_BACKGROUND: "--card-background",
    SIDEBAR_BACKGROUND: "--sidebar-background",
    HEADER_BACKGROUND: "--header-background",
    BORDER: "--border",
    BORDER_CONCEALED: "--border-concealed",
    GRAYSCALE_1: "--grayscale-a1",
    GRAYSCALE_2: "--grayscale-a2",
    GRAYSCALE_3: "--grayscale-a3",
    GRAYSCALE_4: "--grayscale-a4",
    GRAYSCALE_5: "--grayscale-a5",
    GRAYSCALE_6: "--grayscale-a6",
    GRAYSCALE_7: "--grayscale-a7",
    GRAYSCALE_8: "--grayscale-a8",
    GRAYSCALE_9: "--grayscale-a9",
    GRAYSCALE_10: "--grayscale-a10",
    GRAYSCALE_11: "--grayscale-a11",
    GRAYSCALE_12: "--grayscale-a12",
} as const;

function isRgbColor(color: unknown): color is DocsV1Read.RgbaColor {
    if (typeof color !== "object" || color == null) {
        return false;
    }
    return "r" in color && "g" in color && "b" in color;
}

function getColor(
    colors: ColorsConfig,
    key: "background" | "accentPrimary",
    theme: "light" | "dark",
): tinycolor.Instance {
    const color = colors[theme]?.[key];
    if (isRgbColor(color)) {
        return tinycolor({ r: color.r, g: color.g, b: color.b });
    } else {
        return tinycolor(DEFAULT_COLORS[key][theme]);
    }
}

function getColor2(
    colors: ColorsConfig,
    key: "background" | "accentPrimary" | "cardBackground" | "sidebarBackground" | "headerBackground" | "border",
    theme: "light" | "dark",
): tinycolor.Instance | undefined {
    const color = colors[theme]?.[key];
    if (isRgbColor(color)) {
        return tinycolor({ r: color.r, g: color.g, b: color.b });
    }
    return undefined;
}

export function getColorVariables(colorsV3: ColorsConfig): {
    light: Record<string, string>;
    dark: Record<string, string>;
} {
    const backgroundColorLight = enforceBackgroundTheme(getColor(colorsV3, "background", "light"), "light").toRgb();
    const backgroundColorDark = enforceBackgroundTheme(getColor(colorsV3, "background", "dark"), "dark").toRgb();

    const radixGrayscaleLight = getClosestGrayColor(tinycolor(backgroundColorLight), "light");
    const radixGrayscaleDark = getClosestGrayColor(tinycolor(backgroundColorDark), "dark");

    const accentPrimaryLightUi = increaseForegroundContrast(
        getColor(colorsV3, "accentPrimary", "light"),
        tinycolor(backgroundColorLight),
        "ui",
    ).toRgb();
    const accentPrimaryDarkUi = increaseForegroundContrast(
        getColor(colorsV3, "accentPrimary", "dark"),
        tinycolor(backgroundColorDark),
        "ui",
    ).toRgb();

    const accentPrimaryLightContrast = tinycolor(accentPrimaryLightUi).isLight()
        ? { r: 0, g: 0, b: 0 }
        : { r: 255, g: 255, b: 255 };
    const accentPrimaryDarkContrast = tinycolor(accentPrimaryDarkUi).isLight()
        ? { r: 0, g: 0, b: 0 }
        : { r: 255, g: 255, b: 255 };

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
        getColor(colorsV3, "accentPrimary", "light"),
        tinycolor(backgroundColorLight),
        "aa",
    ).toRgb();
    const accentPrimaryDarkAA = increaseForegroundContrast(
        getColor(colorsV3, "accentPrimary", "dark"),
        tinycolor(backgroundColorDark),
        "aa",
    ).toRgb();

    const accentPrimaryLightAAA = increaseForegroundContrast(
        getColor(colorsV3, "accentPrimary", "light"),
        tinycolor(backgroundColorLight),
        "aaa",
    ).toRgb();
    const accentPrimaryDarkAAA = increaseForegroundContrast(
        getColor(colorsV3, "accentPrimary", "dark"),
        tinycolor(backgroundColorDark),
        "aaa",
    ).toRgb();

    const cardBackgroundLight = getColor2(colorsV3, "cardBackground", "light");
    const cardBackgroundDark = getColor2(colorsV3, "cardBackground", "dark");
    const sidebarBackgroundLight = getColor2(colorsV3, "sidebarBackground", "light");
    const sidebarBackgroundDark = getColor2(colorsV3, "sidebarBackground", "dark");
    const headerBackgroundLight = getColor2(colorsV3, "headerBackground", "light");
    const headerBackgroundDark = getColor2(colorsV3, "headerBackground", "dark");
    const borderLight = getColor2(colorsV3, "border", "light");
    const borderDark = getColor2(colorsV3, "border", "dark");

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

            [CSS_VARIABLES.ACCENT_PRIMARY]: `${accentPrimaryLightUi.r}, ${accentPrimaryLightUi.g}, ${accentPrimaryLightUi.b}`,
            [CSS_VARIABLES.ACCENT_PRIMARY_AA]: `${accentPrimaryLightAA.r}, ${accentPrimaryLightAA.g}, ${accentPrimaryLightAA.b}`,
            [CSS_VARIABLES.ACCENT_PRIMARY_AAA]: `${accentPrimaryLightAAA.r}, ${accentPrimaryLightAAA.g}, ${accentPrimaryLightAAA.b}`,
            [CSS_VARIABLES.ACCENT_PRIMARY_TINTED]: `${accentPrimaryLightTinted.r}, ${accentPrimaryLightTinted.g}, ${accentPrimaryLightTinted.b}`,
            [CSS_VARIABLES.BACKGROUND]: `${backgroundColorLight.r}, ${backgroundColorLight.g}, ${backgroundColorLight.b}`,
            [CSS_VARIABLES.ACCENT_PRIMARY_CONTRAST]: `${accentPrimaryLightContrast.r}, ${accentPrimaryLightContrast.g}, ${accentPrimaryLightContrast.b}`,
            [CSS_VARIABLES.CARD_BACKGROUND]:
                cardBackgroundLight?.toRgbString() ?? tinycolor("white").setAlpha(0.7).toRgbString(),
            [CSS_VARIABLES.SIDEBAR_BACKGROUND]: sidebarBackgroundLight?.toRgbString() ?? "transparent",
            [CSS_VARIABLES.HEADER_BACKGROUND]: headerBackgroundLight?.toRgbString() ?? "transparent",
            [CSS_VARIABLES.BORDER]: borderLight?.toRgbString() ?? "var(--grayscale-a5)",
            [CSS_VARIABLES.BORDER_CONCEALED]: borderLight?.toRgbString() ?? "var(--grayscale-a3)",
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

            [CSS_VARIABLES.ACCENT_PRIMARY]: `${accentPrimaryDarkUi.r}, ${accentPrimaryDarkUi.g}, ${accentPrimaryDarkUi.b}`,
            [CSS_VARIABLES.ACCENT_PRIMARY_AA]: `${accentPrimaryDarkAA.r}, ${accentPrimaryDarkAA.g}, ${accentPrimaryDarkAA.b}`,
            [CSS_VARIABLES.ACCENT_PRIMARY_AAA]: `${accentPrimaryDarkAAA.r}, ${accentPrimaryDarkAAA.g}, ${accentPrimaryDarkAAA.b}`,
            [CSS_VARIABLES.ACCENT_PRIMARY_TINTED]: `${accentPrimaryDarkTinted.r}, ${accentPrimaryDarkTinted.g}, ${accentPrimaryDarkTinted.b}`,
            [CSS_VARIABLES.BACKGROUND]: `${backgroundColorDark.r}, ${backgroundColorDark.g}, ${backgroundColorDark.b}`,
            [CSS_VARIABLES.ACCENT_PRIMARY_CONTRAST]: `${accentPrimaryDarkContrast.r}, ${accentPrimaryDarkContrast.g}, ${accentPrimaryDarkContrast.b}`,
            [CSS_VARIABLES.CARD_BACKGROUND]: cardBackgroundDark?.toRgbString() ?? "var(--grayscale-a2)",
            [CSS_VARIABLES.SIDEBAR_BACKGROUND]: sidebarBackgroundDark?.toRgbString() ?? "transparent",
            [CSS_VARIABLES.HEADER_BACKGROUND]: headerBackgroundDark?.toRgbString() ?? "transparent",
            [CSS_VARIABLES.BORDER]: borderDark?.toRgbString() ?? "var(--grayscale-a5)",
            [CSS_VARIABLES.BORDER_CONCEALED]: borderDark?.toRgbString() ?? "var(--grayscale-a3)",
        },
    };
}

export function increaseForegroundContrast(
    foregroundColor: tinycolor.Instance,
    backgroundColor: tinycolor.Instance,
    ratio: "aaa" | "aa" | "ui",
): tinycolor.Instance {
    let newForgroundColor = foregroundColor;
    const dark = backgroundColor.isDark();
    const desiredRatio = ratio === "aa" ? 4.5 : ratio === "aaa" ? 7 : 3;
    while (tinycolor.readability(newForgroundColor, backgroundColor) < desiredRatio) {
        if (dark ? newForgroundColor.getBrightness() === 255 : newForgroundColor.getBrightness() === 0) {
            // if the color is already at its maximum or minimum brightness, stop adjusting
            break;
        }
        // if the accent color is still not readable, adjust it by 1% until it is
        // if the theme is dark, lighten the color, otherwise darken it
        newForgroundColor = dark ? newForgroundColor.lighten(1) : newForgroundColor.darken(1);
    }
    return newForgroundColor;
}

export function enforceBackgroundTheme(color: tinycolor.Instance, theme: "dark" | "light"): tinycolor.Instance {
    if (theme === "dark" && color.isDark()) {
        return color;
    } else if (theme === "light" && color.isLight()) {
        return color;
    }

    return getOppositeBrightness(color);
}

function getOppositeBrightness(color: tinycolor.Instance): tinycolor.Instance;
function getOppositeBrightness(color: tinycolor.Instance | undefined): tinycolor.Instance | undefined;
function getOppositeBrightness(color: tinycolor.Instance | undefined): tinycolor.Instance | undefined {
    if (color == null) {
        return undefined;
    }

    const { h, s, v } = color.toHsv();
    return tinycolor({ h, s, v: 1 - v });
}

function getColorDistance(color1: tinycolor.Instance, color2: tinycolor.Instance): number {
    const rgb1 = color1.toRgb();
    const rgb2 = color2.toRgb();
    const rMean = (rgb1.r + rgb2.r) / 2;
    const r = rgb1.r - rgb2.r;
    const g = rgb1.g - rgb2.g;
    const b = rgb1.b - rgb2.b;
    return Math.sqrt((2 + rMean / 256) * (r * r) + 4 * (g * g) + (2 + (255 - rMean) / 256) * (b * b));
}

type RadixGray = "gray" | "mauve" | "slate" | "sage" | "olive" | "sand";

function getRadixGrayVar(gray: RadixGray, scale: number): string {
    return `var(--${gray}-a${scale})`;
}

const DARK_GRAY_COLOR_SAMPLES: Record<RadixGray, tinycolor.Instance> = {
    gray: tinycolor(gray.gray6),
    mauve: tinycolor(mauve.mauve6),
    slate: tinycolor(slate.slate6),
    sage: tinycolor(sage.sage6),
    olive: tinycolor(olive.olive6),
    sand: tinycolor(sand.sand6),
};

const LIGHT_GRAY_COLOR_SAMPLES: Record<RadixGray, tinycolor.Instance> = {
    gray: tinycolor(gray.gray3),
    mauve: tinycolor(mauve.mauve3),
    slate: tinycolor(slate.slate3),
    sage: tinycolor(sage.sage3),
    olive: tinycolor(olive.olive3),
    sand: tinycolor(sand.sand3),
};

const GRAY_COLOR_SAMPLES: Record<"light" | "dark", Record<RadixGray, tinycolor.Instance>> = {
    light: LIGHT_GRAY_COLOR_SAMPLES,
    dark: DARK_GRAY_COLOR_SAMPLES,
};

function getClosestGrayColor(color: tinycolor.Instance, theme: "light" | "dark"): RadixGray {
    let closestColor: RadixGray = "gray";
    let closestDistance = Infinity;
    for (const [gray, sampleColor] of Object.entries(GRAY_COLOR_SAMPLES[theme])) {
        const distance = getColorDistance(color, sampleColor);
        if (distance < closestDistance) {
            closestDistance = distance;
            closestColor = gray as RadixGray;
        }
    }
    return closestColor;
}
