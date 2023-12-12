"use client";

import { ThemeProvider as NextThemeProvider } from "next-themes";
import { DEFAULT_THEME, THEMES } from "./theme";

export const ThemeProviderWithLayout: React.FC<React.PropsWithChildren> = ({ children }) => (
    <NextThemeProvider defaultTheme={DEFAULT_THEME} enableSystem={false} themes={THEMES} attribute="class">
        <div className="w-full">{children}</div>
    </NextThemeProvider>
);
