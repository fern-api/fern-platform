import { useCallback, useMemo } from "react";
import { useDocsContext } from "../docs-context/useDocsContext";

type ColorSelectors = {
    getAccentPrimary: (opacity: number) => string | undefined;
};

export function useColorSelectors(): ColorSelectors {
    const { docsDefinition, theme } = useDocsContext();
    const { colorsV3: colors } = docsDefinition.config;

    const accentPrimary = useMemo(() => {
        if (theme == null) {
            return undefined;
        }
        return colors.type === "darkAndLight" ? colors[theme].accentPrimary : colors.accentPrimary;
    }, [theme, colors]);

    const getAccentPrimary = useCallback(
        (opacity: number) => {
            if (accentPrimary == null) {
                return undefined;
            }
            return `rgba(${accentPrimary.r},${accentPrimary.g},${accentPrimary.b},${opacity})`;
        },
        [accentPrimary]
    );

    return { getAccentPrimary };
}
