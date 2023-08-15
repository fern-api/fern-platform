import * as FernRegistryDocsRead from "@fern-fern/registry-browser/api/resources/docs/resources/v1/resources/read";
import { useTheme } from "@fern-ui/theme";
import { useEffect } from "react";

const DEFAULT_ACCENT_PRIMARY: FernRegistryDocsRead.RgbColor = {
    r: 129,
    g: 140,
    b: 248,
};

const CSS_VARIABLES = {
    ACCENT_PRIMARY: "--accent-primary",
} as const;

export function useCustomTheme(docsDefinition: FernRegistryDocsRead.DocsDefinition): void {
    const { theme } = useTheme();

    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const root = document.querySelector<HTMLElement>(":root")!;
        const colorsV2 = docsDefinition.config.colorsV2;
        let accentPrimary = undefined;
        if (colorsV2?.accentPrimary?.type === "themed") {
            if (theme === undefined) {
                return;
            }
            accentPrimary = colorsV2.accentPrimary[theme] ?? DEFAULT_ACCENT_PRIMARY;
        } else if (colorsV2?.accentPrimary?.type === "unthemed") {
            accentPrimary = colorsV2.accentPrimary.color ?? DEFAULT_ACCENT_PRIMARY;
        } else if (docsDefinition.config.colors?.accentPrimary) {
            accentPrimary = docsDefinition.config.colors.accentPrimary;
        } else {
            accentPrimary = DEFAULT_ACCENT_PRIMARY;
        }
        root.style.setProperty(
            CSS_VARIABLES.ACCENT_PRIMARY,
            `${accentPrimary.r}, ${accentPrimary.g}, ${accentPrimary.b}`
        );
    }, [docsDefinition.config.colorsV2, docsDefinition.config.colors, theme]);
}
