import * as FernRegistryDocsRead from "@fern-api/fdr-sdk/dist/generated/api/resources/docs/resources/v1/resources/read";
import { useTheme } from "@fern-ui/theme";

interface ColorConfig {
    dark: FernRegistryDocsRead.RgbColor;
    light: FernRegistryDocsRead.RgbColor;
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
} as const;

export function useColorTheme(docsDefinition: FernRegistryDocsRead.DocsDefinition): string {
    const colorsV3 = docsDefinition.config.colorsV3;
    const { theme } = useTheme(colorsV3.type);

    if (theme == null) {
        return "";
    }

    const accentPrimary = colorsV3.type !== "darkAndLight" ? colorsV3.accentPrimary : colorsV3[theme].accentPrimary;
    const background = colorsV3.type !== "darkAndLight" ? colorsV3.background : colorsV3[theme].background;
    const backgroundColor = background.type === "solid" ? background : DEFAULT_COLORS.background[theme];

    return `
        :root {
            ${CSS_VARIABLES.ACCENT_PRIMARY}: ${accentPrimary.r}, ${accentPrimary.g}, ${accentPrimary.b};
            ${CSS_VARIABLES.BACKGROUND}: ${backgroundColor.r}, ${backgroundColor.g}, ${backgroundColor.b};
        }
    `;
}
