import * as FernRegistryDocsRead from "@fern-fern/registry-browser/api/resources/docs/resources/v1/resources/read";
import { useDeepCompareMemoize } from "@fern-ui/react-commons";
import { useTheme } from "@fern-ui/theme";
import { useEffect } from "react";
import { DEFAULT_COLORS } from "../config";

const CSS_VARIABLES = {
    ACCENT_PRIMARY: "--accent-primary",
    BACKGROUND: "--background",
} as const;

export function useCustomTheme(docsDefinition: FernRegistryDocsRead.DocsDefinition): void {
    const { theme } = useTheme(docsDefinition.config.colorsV3.type);

    useEffect(() => {
        if (theme == null) {
            return;
        }

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const root = document.querySelector<HTMLElement>(":root")!;
        const colorsV3 = docsDefinition.config.colorsV3;

        const accentPrimary = colorsV3.type !== "darkAndLight" ? colorsV3.accentPrimary : colorsV3[theme].accentPrimary;

        root.style.setProperty(
            CSS_VARIABLES.ACCENT_PRIMARY,
            `${accentPrimary.r}, ${accentPrimary.g}, ${accentPrimary.b}`
        );

        const background = colorsV3.type !== "darkAndLight" ? colorsV3.background : colorsV3[theme].background;

        if (background.type === "solid") {
            root.style.setProperty(CSS_VARIABLES.BACKGROUND, `${background.r}, ${background.g}, ${background.b}`);
        } else {
            root.style.setProperty(
                CSS_VARIABLES.BACKGROUND,
                `${DEFAULT_COLORS.background[theme].r}, ${DEFAULT_COLORS.background[theme].g}, ${DEFAULT_COLORS.background[theme].b}`
            );
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, useDeepCompareMemoize([docsDefinition.config.colorsV2, docsDefinition.config.colors, theme]));
}
