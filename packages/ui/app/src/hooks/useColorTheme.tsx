import { DocsV1Read } from "@fern-api/fdr-sdk";
import { useTheme } from "@fern-ui/theme";
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
    // inverted colors are useful for rendering nested components where dark/light mode is inverted
    ACCENT_PRIMARY_INVERTED: "--accent-primary-inverted",
    BACKGROUND_INVERTED: "--background-inverted",
} as const;

export function useColorTheme(docsDefinition: DocsV1Read.DocsDefinition): string {
    const colorsV3 = docsDefinition.config.colorsV3;
    const { theme } = useTheme(colorsV3.type);
    const invertedTheme = theme === "dark" ? "light" : "dark";

    if (theme == null) {
        return "";
    }

    const accentPrimary = colorsV3.type !== "darkAndLight" ? colorsV3.accentPrimary : colorsV3[theme].accentPrimary;
    const background = colorsV3.type !== "darkAndLight" ? colorsV3.background : colorsV3[theme].background;
    const backgroundColor = background.type === "solid" ? background : DEFAULT_COLORS.background[theme];
    const accentPrimaryInverted =
        colorsV3.type !== "darkAndLight"
            ? tinycolor(colorsV3.accentPrimary).isDark()
                ? tinycolor("white").toRgb()
                : tinycolor("black").toRgb()
            : colorsV3[invertedTheme].accentPrimary;
    const backgroundInverted =
        colorsV3.type !== "darkAndLight" ? colorsV3.background : colorsV3[invertedTheme].background;
    const backgroundColorInverted =
        backgroundInverted.type === "solid" ? backgroundInverted : DEFAULT_COLORS.background[invertedTheme];

    return `
        :root {
            ${CSS_VARIABLES.ACCENT_PRIMARY}: ${accentPrimary.r}, ${accentPrimary.g}, ${accentPrimary.b};
            ${CSS_VARIABLES.BACKGROUND}: ${backgroundColor.r}, ${backgroundColor.g}, ${backgroundColor.b};
            ${CSS_VARIABLES.ACCENT_PRIMARY_INVERTED}: ${accentPrimaryInverted.r}, ${accentPrimaryInverted.g}, ${accentPrimaryInverted.b};
            ${CSS_VARIABLES.BACKGROUND_INVERTED}: ${backgroundColorInverted.r}, ${backgroundColorInverted.g}, ${backgroundColorInverted.b};
        }
    `;
}
