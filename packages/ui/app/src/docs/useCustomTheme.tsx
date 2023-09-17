import * as FernRegistryDocsRead from "@fern-fern/registry-browser/api/resources/docs/resources/v1/resources/read";
import { useTheme } from "@fern-ui/theme";
import { DEFAULT_COLORS } from "../config";

const CSS_VARIABLES = {
    ACCENT_PRIMARY: "--accent-primary",
    BACKGROUND: "--background",
} as const;

export function useCustomTheme(docsDefinition: FernRegistryDocsRead.DocsDefinition): JSX.Element {
    const colorsV3 = docsDefinition.config.colorsV3;
    const { theme } = useTheme(colorsV3.type);

    if (theme == null) {
        return <></>;
    }

    const accentPrimary = colorsV3.type !== "darkAndLight" ? colorsV3.accentPrimary : colorsV3[theme].accentPrimary;
    const background = colorsV3.type !== "darkAndLight" ? colorsV3.background : colorsV3[theme].background;
    const backgroundColor = background.type === "solid" ? background : DEFAULT_COLORS.background[theme];

    return (
        <style global={true} jsx={true}>
            {`
                :root {
                    ${CSS_VARIABLES.ACCENT_PRIMARY}: ${accentPrimary.r}, ${accentPrimary.g}, ${accentPrimary.b};
                    ${CSS_VARIABLES.BACKGROUND}: ${backgroundColor.r}, ${backgroundColor.g}, ${backgroundColor.b};
                }
            `}
        </style>
    );
}
