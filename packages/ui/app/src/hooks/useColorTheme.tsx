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
    // inverted colors are useful for rendering nested components where dark/light mode is inverted
    ACCENT_PRIMARY_DARK: "--accent-primary-dark",
    BACKGROUND_DARK: "--background-dark",
} as const;

export function useColorTheme(docsDefinition: DocsV1Read.DocsDefinition): string {
    const colorsV3 = docsDefinition.config.colorsV3;
    // const { theme } = useTheme(colorsV3.type);
    // const invertedTheme = theme === "dark" ? "light" : "dark";

    // if (theme == null) {
    //     return "";
    // }

    const accentPrimary = colorsV3.type !== "darkAndLight" ? colorsV3.accentPrimary : colorsV3["light"].accentPrimary;
    const background = colorsV3.type !== "darkAndLight" ? colorsV3.background : colorsV3["light"].background;
    const backgroundColor = background.type === "solid" ? background : DEFAULT_COLORS.background["light"];
    const accentPrimaryDark =
        colorsV3.type !== "darkAndLight"
            ? tinycolor(colorsV3.accentPrimary).isDark()
                ? tinycolor("white").toRgb()
                : tinycolor("black").toRgb()
            : colorsV3["dark"].accentPrimary;
    const backgroundDark = colorsV3.type !== "darkAndLight" ? colorsV3.background : colorsV3["dark"].background;
    const backgroundColorDark = backgroundDark.type === "solid" ? backgroundDark : DEFAULT_COLORS.background["dark"];

    return `
        :root {
            ${CSS_VARIABLES.ACCENT_PRIMARY}: ${accentPrimary.r}, ${accentPrimary.g}, ${accentPrimary.b};
            ${CSS_VARIABLES.BACKGROUND}: ${backgroundColor.r}, ${backgroundColor.g}, ${backgroundColor.b};
            ${CSS_VARIABLES.ACCENT_PRIMARY_DARK}: ${accentPrimaryDark.r}, ${accentPrimaryDark.g}, ${accentPrimaryDark.b};
            ${CSS_VARIABLES.BACKGROUND_DARK}: ${backgroundColorDark.r}, ${backgroundColorDark.g}, ${backgroundColorDark.b};
        }
    `;
}
