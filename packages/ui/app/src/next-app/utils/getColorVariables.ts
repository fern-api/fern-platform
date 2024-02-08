import { DocsV1Read } from "@fern-api/fdr-sdk";
import tinycolor from "tinycolor2";

interface ColorConfig {
    dark: DocsV1Read.RgbColor;
    light: DocsV1Read.RgbColor;
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
    ACCENT_PRIMARY_LIGHT: "--accent-primary-light",
    ACCENT_PRIMARY_DARK: "--accent-primary-dark",
    ACCENT_PRIMARY_AA_LIGHT: "--accent-primary-aa-light",
    ACCENT_PRIMARY_AA_DARK: "--accent-primary-aa-dark",
    ACCENT_PRIMARY_AAA_LIGHT: "--accent-primary-aaa-light",
    ACCENT_PRIMARY_AAA_DARK: "--accent-primary-aaa-dark",
    ACCENT_PRIMARY_LIGHT_TINTED: "--accent-primary-light-tinted", // for hover state
    ACCENT_PRIMARY_DARK_TINTED: "--accent-primary-dark-tinted", // for hover state
    BACKGROUND_LIGHT: "--background-light",
    BACKGROUND_DARK: "--background-dark",
    // contrast colors are useful for rendering text on top of where accent is the background color
    ACCENT_PRIMARY_LIGHT_CONTRAST: "--accent-primary-light-contrast",
    ACCENT_PRIMARY_DARK_CONTRAST: "--accent-primary-dark-contrast",
} as const;

function isRgbColor(color: unknown): color is DocsV1Read.RgbColor {
    if (typeof color !== "object" || color == null) {
        return false;
    }
    return "r" in color && "g" in color && "b" in color;
}

function getColor(
    colorsV3: DocsV1Read.ColorsConfigV3,
    key: "background" | "accentPrimary",
    theme: "light" | "dark",
): tinycolor.Instance {
    const color = colorsV3.type !== "darkAndLight" ? colorsV3[key] : colorsV3[theme][key];
    if (isRgbColor(color)) {
        return tinycolor({ r: color.r, g: color.g, b: color.b });
    } else {
        return tinycolor(DEFAULT_COLORS[key][theme]);
    }
}

export function getColorVariables(colorsV3: DocsV1Read.ColorsConfigV3 | undefined): Record<string, string> {
    if (colorsV3 == null) {
        // eslint-disable-next-line no-console
        console.error("No colors config found.");

        // TODO: set default colors
        return {};
    }

    const backgroundColorLight = toRgb(enforceBackgroundTheme(getColor(colorsV3, "background", "light"), "light"));
    const backgroundColorDark = toRgb(enforceBackgroundTheme(getColor(colorsV3, "background", "dark"), "dark"));

    const accentPrimaryLightUi = toRgb(
        increaseForegroundContrast(getColor(colorsV3, "accentPrimary", "light"), tinycolor(backgroundColorLight), "ui"),
    );
    const accentPrimaryDarkUi = toRgb(
        increaseForegroundContrast(getColor(colorsV3, "accentPrimary", "dark"), tinycolor(backgroundColorDark), "ui"),
    );

    const accentPrimaryLightContrast = tinycolor(accentPrimaryLightUi).isLight()
        ? { r: 0, g: 0, b: 0 }
        : { r: 255, g: 255, b: 255 };
    const accentPrimaryDarkContrast = tinycolor(accentPrimaryDarkUi).isLight()
        ? { r: 0, g: 0, b: 0 }
        : { r: 255, g: 255, b: 255 };

    const accentPrimaryLightTinted = toRgb(
        tinycolor(accentPrimaryLightUi).isLight()
            ? tinycolor(accentPrimaryLightUi).lighten(5)
            : tinycolor(accentPrimaryLightUi).darken(5),
    );
    const accentPrimaryDarkTinted = toRgb(
        tinycolor(accentPrimaryDarkUi).isLight()
            ? tinycolor(accentPrimaryDarkUi).lighten(5)
            : tinycolor(accentPrimaryDarkUi).darken(5),
    );

    const accentPrimaryLightAA = toRgb(
        increaseForegroundContrast(getColor(colorsV3, "accentPrimary", "light"), tinycolor(backgroundColorLight), "aa"),
    );
    const accentPrimaryDarkAA = toRgb(
        increaseForegroundContrast(getColor(colorsV3, "accentPrimary", "dark"), tinycolor(backgroundColorDark), "aa"),
    );

    const accentPrimaryLightAAA = toRgb(
        increaseForegroundContrast(
            getColor(colorsV3, "accentPrimary", "light"),
            tinycolor(backgroundColorLight),
            "aaa",
        ),
    );
    const accentPrimaryDarkAAA = toRgb(
        increaseForegroundContrast(getColor(colorsV3, "accentPrimary", "dark"), tinycolor(backgroundColorDark), "aaa"),
    );

    // const accentPrimaryTinyColor = tinycolor(accentPrimary);
    // const accentPrimaryDarkened = (
    //     accentPrimaryTinyColor.isDark() ? accentPrimaryTinyColor.darken() : accentPrimaryTinyColor.lighten()
    // ).toRgb();
    // const accentPrimaryDark =
    //     colorsV3.type !== "darkAndLight" ? colorsV3.accentPrimary : colorsV3["dark"].accentPrimary;

    // const accentPrimaryDarkTinyColor = tinycolor(accentPrimaryDark);
    // const accentPrimaryDarkenedLuminance = accentPrimaryDarkTinyColor.getLuminance();
    // const accentPrimaryDarkLightened = (
    //     accentPrimaryDarkTinyColor.isDark()
    //         ? accentPrimaryDarkTinyColor.lighten(20 * accentPrimaryDarkenedLuminance)
    //         : accentPrimaryDarkTinyColor.darken(20 * accentPrimaryDarkenedLuminance)
    // ).toRgb();
    // const accentPrimaryContrast = tinycolor(accentPrimary).isDark()
    //     ? tinycolor("white").toRgb()
    //     : tinycolor("black").toRgb();
    // const accentPrimaryDarkContrast = tinycolor(accentPrimaryDark).isDark()
    //     ? tinycolor("white").toRgb()
    //     : tinycolor("black").toRgb();
    // const backgroundDark = colorsV3?.type !== "darkAndLight" ? colorsV3?.background : colorsV3["dark"].background;
    // const backgroundColorDark = backgroundDark?.type === "solid" ? backgroundDark : DEFAULT_COLORS.background["dark"];

    return {
        [CSS_VARIABLES.ACCENT_PRIMARY_LIGHT]: `${accentPrimaryLightUi.r}, ${accentPrimaryLightUi.g}, ${accentPrimaryLightUi.b}`,
        [CSS_VARIABLES.ACCENT_PRIMARY_DARK]: `${accentPrimaryDarkUi.r}, ${accentPrimaryDarkUi.g}, ${accentPrimaryDarkUi.b}`,
        [CSS_VARIABLES.ACCENT_PRIMARY_AA_LIGHT]: `${accentPrimaryLightAA.r}, ${accentPrimaryLightAA.g}, ${accentPrimaryLightAA.b}`,
        [CSS_VARIABLES.ACCENT_PRIMARY_AA_DARK]: `${accentPrimaryDarkAA.r}, ${accentPrimaryDarkAA.g}, ${accentPrimaryDarkAA.b}`,
        [CSS_VARIABLES.ACCENT_PRIMARY_AAA_LIGHT]: `${accentPrimaryLightAAA.r}, ${accentPrimaryLightAAA.g}, ${accentPrimaryLightAAA.b}`,
        [CSS_VARIABLES.ACCENT_PRIMARY_AAA_DARK]: `${accentPrimaryDarkAAA.r}, ${accentPrimaryDarkAAA.g}, ${accentPrimaryDarkAAA.b}`,
        [CSS_VARIABLES.ACCENT_PRIMARY_LIGHT_TINTED]: `${accentPrimaryLightTinted.r}, ${accentPrimaryLightTinted.g}, ${accentPrimaryLightTinted.b}`,
        [CSS_VARIABLES.ACCENT_PRIMARY_DARK_TINTED]: `${accentPrimaryDarkTinted.r}, ${accentPrimaryDarkTinted.g}, ${accentPrimaryDarkTinted.b}`,
        [CSS_VARIABLES.BACKGROUND_LIGHT]: `${backgroundColorLight.r}, ${backgroundColorLight.g}, ${backgroundColorLight.b}`,
        [CSS_VARIABLES.BACKGROUND_DARK]: `${backgroundColorDark.r}, ${backgroundColorDark.g}, ${backgroundColorDark.b}`,
        [CSS_VARIABLES.ACCENT_PRIMARY_LIGHT_CONTRAST]: `${accentPrimaryLightContrast.r}, ${accentPrimaryLightContrast.g}, ${accentPrimaryLightContrast.b}`,
        [CSS_VARIABLES.ACCENT_PRIMARY_DARK_CONTRAST]: `${accentPrimaryDarkContrast.r}, ${accentPrimaryDarkContrast.g}, ${accentPrimaryDarkContrast.b}`,
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

function toRgb(color: tinycolor.Instance): DocsV1Read.RgbColor;
function toRgb(color: tinycolor.Instance | undefined): DocsV1Read.RgbColor | undefined;
function toRgb(color: tinycolor.Instance | undefined): DocsV1Read.RgbColor | undefined {
    if (color == null) {
        return undefined;
    }
    const { r, g, b } = color.toRgb();
    return { r, g, b };
}
