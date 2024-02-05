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

const CSS_VARIABLES = {
    ACCENT_PRIMARY: "--accent-primary",
    BACKGROUND: "--background",
    ACCENT_PRIMARY_DARK: "--accent-primary-dark",
    BACKGROUND_DARK: "--background-dark",
    // contrast colors are useful for rendering text on top of where accent is the background color
    ACCENT_PRIMARY_CONTRAST: "--accent-primary-contrast",
    ACCENT_PRIMARY_DARK_CONTRAST: "--accent-primary-dark-contrast",
} as const;

export function useColorTheme(config: DocsV1Read.DocsConfig): string {
    const colorsV3 = config.colorsV3;
    // const { theme } = useTheme(colorsV3.type);
    // const invertedTheme = theme === "dark" ? "light" : "dark";

    // if (theme == null) {
    //     return "";
    // }

    const accentPrimary =
        colorsV3?.type !== "darkAndLight"
            ? colorsV3?.accentPrimary ?? DEFAULT_COLORS.accentPrimary["light"]
            : colorsV3["light"].accentPrimary;
    const background = colorsV3?.type !== "darkAndLight" ? colorsV3?.background : colorsV3["light"].background;
    const backgroundColor = background?.type === "solid" ? background : DEFAULT_COLORS.background["light"];
    const accentPrimaryDark =
        colorsV3?.type !== "darkAndLight"
            ? colorsV3?.accentPrimary ?? DEFAULT_COLORS.accentPrimary["dark"]
            : colorsV3["dark"].accentPrimary;
    const accentPrimaryContrast = tinycolor(accentPrimary).isDark()
        ? tinycolor("white").toRgb()
        : tinycolor("black").toRgb();
    const accentPrimaryDarkContrast = tinycolor(accentPrimaryDark).isDark()
        ? tinycolor("white").toRgb()
        : tinycolor("black").toRgb();
    const backgroundDark = colorsV3?.type !== "darkAndLight" ? colorsV3?.background : colorsV3["dark"].background;
    const backgroundColorDark = backgroundDark?.type === "solid" ? backgroundDark : DEFAULT_COLORS.background["dark"];

    const themeBackgroundColor = background?.type === "solid" ? background : tinycolor(accentPrimary);
    const themeBackgroundColorDark = backgroundDark?.type === "solid" ? backgroundDark : tinycolor(accentPrimary);

    return `
        :root {
            ${CSS_VARIABLES.ACCENT_PRIMARY}: ${accentPrimary.r}, ${accentPrimary.g}, ${accentPrimary.b};
            ${CSS_VARIABLES.BACKGROUND}: ${backgroundColor.r}, ${backgroundColor.g}, ${backgroundColor.b};
            ${CSS_VARIABLES.ACCENT_PRIMARY_DARK}: ${accentPrimaryDark.r}, ${accentPrimaryDark.g}, ${
                accentPrimaryDark.b
            };
            ${CSS_VARIABLES.BACKGROUND_DARK}: ${backgroundColorDark.r}, ${backgroundColorDark.g}, ${
                backgroundColorDark.b
            };
            ${CSS_VARIABLES.ACCENT_PRIMARY_CONTRAST}: ${accentPrimaryContrast.r}, ${accentPrimaryContrast.g}, ${
                accentPrimaryContrast.b
            };
            ${CSS_VARIABLES.ACCENT_PRIMARY_DARK_CONTRAST}: ${accentPrimaryDarkContrast.r}, ${
                accentPrimaryDarkContrast.g
            }, ${accentPrimaryDarkContrast.b};
        }


        html {
            background-color: #${tinycolor(themeBackgroundColor).toHex()};
        }

        html.dark {
            background-color: #${tinycolor(themeBackgroundColorDark).toHex()};
        }
    `;
}
