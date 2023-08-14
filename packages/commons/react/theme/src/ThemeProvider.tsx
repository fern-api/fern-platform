import { ThemeProvider as NextThemeProvider } from "next-themes";
import { DEFAULT_THEME, THEMES } from "./theme";

export const ThemeProvider: React.FC<React.PropsWithChildren<{ forcedTheme?: string }>> = ({
    forcedTheme,
    children,
}) => (
    <NextThemeProvider
        defaultTheme={DEFAULT_THEME}
        forcedTheme={forcedTheme}
        enableSystem={false}
        themes={THEMES}
        attribute="class"
    >
        {children}
    </NextThemeProvider>
);
