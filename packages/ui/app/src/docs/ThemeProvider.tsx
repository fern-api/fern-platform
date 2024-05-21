import { ColorsConfig } from "@fern-ui/fdr-utils";
import { ThemeProvider as NextThemeProvider, useTheme } from "next-themes";
import { PropsWithChildren, ReactElement, useEffect, useMemo } from "react";

interface ThemeProviderProps {
    colors: ColorsConfig | undefined;
}

export function ThemeProvider({ colors, children }: PropsWithChildren<ThemeProviderProps>): ReactElement {
    const theme =
        colors?.dark != null && colors?.light != null ? "darkAndLight" : colors?.dark != null ? "dark" : "light";

    const themes = useMemo(() => (theme === "darkAndLight" || theme == null ? ["dark", "light"] : [theme]), [theme]);

    return (
        <NextThemeProvider
            enableSystem={theme === "darkAndLight"}
            forcedTheme={theme !== "darkAndLight" ? theme : undefined}
            themes={themes}
            enableColorScheme={true}
            attribute="class"
            disableTransitionOnChange={true}
        >
            <CorruptedThemeHack />
            {children}
        </NextThemeProvider>
    );
}

function CorruptedThemeHack() {
    const { resolvedTheme: theme, themes, setTheme } = useTheme();
    useEffect(() => {
        // this is a hack to ensure that the theme is always set to a valid value, even if localStorage is corrupted
        if (theme == null || !themes.includes(theme)) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            setTheme(themes.length === 1 ? themes[0]! : "system");
        }
    }, [setTheme, theme, themes]);
    return null;
}
