import type * as FernRegistryDocsRead from "@fern-fern/registry-browser/api/resources/docs/resources/v1/resources/read";

export const DEFAULT_LOGO_HEIGHT = 20;

interface ColorConfig {
    dark: FernRegistryDocsRead.RgbColor;
    light: FernRegistryDocsRead.RgbColor;
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

export const API_ARTIFACTS_TITLE = "Client libraries";
