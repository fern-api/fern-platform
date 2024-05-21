import { ColorsConfig } from "@fern-ui/fdr-utils";
import { noop } from "lodash-es";
import { ThemeProvider as NextThemeProvider, useTheme } from "next-themes";
import {
    PropsWithChildren,
    ReactElement,
    createContext,
    memo,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";

interface ThemeProviderProps {
    colors?: ColorsConfig | undefined;
}

function getThemeFromColors(colors: ColorsConfig | undefined): "dark" | "light" | "darkAndLight" {
    return colors == null || (colors.dark != null && colors.light != null)
        ? "darkAndLight"
        : colors.dark != null
          ? "dark"
          : "light";
}

const ThemeMetaContext = createContext<(colors: ColorsConfig | undefined) => void>(noop);

// this should only be invoked in the local-preview-bundle:
export const useSetThemeColors = (): ((colors: ColorsConfig | undefined) => void) => useContext(ThemeMetaContext);

export const ThemeProvider = memo(({ colors, children }: PropsWithChildren<ThemeProviderProps>): ReactElement => {
    // NextThemeProvider is not stable, and needs to be included in `_app.tsx` to work properly.
    // docs-bundle uses static props to pass in the colors, whereas local-preview-bundle uses a hook.
    const [theme, setTheme] = useState(getThemeFromColors(colors));
    const updateColors = useCallback((colors: ColorsConfig | undefined) => {
        setTheme(getThemeFromColors(colors));
    }, []);

    const themes = useMemo(() => (theme === "darkAndLight" || theme == null ? ["dark", "light"] : [theme]), [theme]);

    return (
        <ThemeMetaContext.Provider value={updateColors}>
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
        </ThemeMetaContext.Provider>
    );
});

ThemeProvider.displayName = "ThemeProvider";

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
