import * as FernRegistryDocsRead from "@fern-fern/registry-browser/api/resources/docs/resources/v1/resources/read";
import { useTheme } from "@fern-ui/theme";
import { useEffect } from "react";
import { DEFAULT_COLORS } from "../config";
import { useDocsContext } from "../docs-context/useDocsContext";

const CSS_VARIABLES = {
    ACCENT_PRIMARY: "--accent-primary",
    BACKGROUND: "--background",
} as const;

export function useCustomTheme(docsDefinition: FernRegistryDocsRead.DocsDefinition): void {
    const { lightModeEnabled } = useDocsContext();
    const { theme } = useTheme(lightModeEnabled);

    useEffect(() => {
        if (theme == null) {
            return;
        }

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const root = document.querySelector<HTMLElement>(":root")!;
        const colorsV2 = docsDefinition.config.colorsV2;

        let accentPrimary = undefined;
        if (colorsV2?.accentPrimary?.type === "themed") {
            accentPrimary = colorsV2.accentPrimary[theme] ?? DEFAULT_COLORS.accentPrimary[theme];
        } else if (colorsV2?.accentPrimary?.type === "unthemed") {
            accentPrimary = colorsV2.accentPrimary.color ?? DEFAULT_COLORS.accentPrimary[theme];
        } else if (docsDefinition.config.colors?.accentPrimary != null) {
            accentPrimary = docsDefinition.config.colors.accentPrimary;
        } else {
            accentPrimary = DEFAULT_COLORS.accentPrimary.dark;
        }
        root.style.setProperty(
            CSS_VARIABLES.ACCENT_PRIMARY,
            `${accentPrimary.r}, ${accentPrimary.g}, ${accentPrimary.b}`
        );

        let background = undefined;
        if (colorsV2?.background?.type === "themed") {
            background = colorsV2.background[theme] ?? DEFAULT_COLORS.background[theme];
        } else if (colorsV2?.background?.type === "unthemed") {
            background = colorsV2.background.color ?? DEFAULT_COLORS.background[theme];
        } else {
            background = DEFAULT_COLORS.background[theme];
        }
        root.style.setProperty(CSS_VARIABLES.BACKGROUND, `${background.r}, ${background.g}, ${background.b}`);
    }, [docsDefinition.config.colorsV2, docsDefinition.config.colors, theme]);
}
