import { DocsV1Read } from "@fern-api/fdr-sdk";
import { useTheme } from "next-themes";
import { useCallback, useMemo } from "react";

type ColorSelectors = {
    getAccentPrimary: (opacity: number) => string | undefined;
};

export function useColorSelectors(config: DocsV1Read.DocsConfig): ColorSelectors {
    const { resolvedTheme: theme } = useTheme();
    const { colorsV3: colors } = config;

    const accentPrimary = useMemo(() => {
        return colors?.type === "darkAndLight"
            ? theme === "dark" || theme === "light"
                ? colors[theme].accentPrimary
                : undefined
            : colors?.accentPrimary;
    }, [theme, colors]);

    const getAccentPrimary = useCallback(
        (opacity: number) => {
            if (accentPrimary == null) {
                return undefined;
            }
            return `rgba(${accentPrimary.r},${accentPrimary.g},${accentPrimary.b},${opacity})`;
        },
        [accentPrimary],
    );

    return { getAccentPrimary };
}
