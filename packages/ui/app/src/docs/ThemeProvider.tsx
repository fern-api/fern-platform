import { DocsV1Read } from "@fern-api/fdr-sdk";
import { ThemeProvider as NextThemeProvider } from "next-themes";
import { PropsWithChildren, ReactElement } from "react";

interface ThemeProviderProps {
    theme: DocsV1Read.ColorsConfigV3["type"] | undefined;
}

export function ThemeProvider({ theme, children }: PropsWithChildren<ThemeProviderProps>): ReactElement {
    return (
        <NextThemeProvider
            enableSystem={theme === "darkAndLight"}
            forcedTheme={theme !== "darkAndLight" ? theme : undefined}
            themes={theme === "darkAndLight" || theme == null ? ["dark", "light"] : [theme]}
            enableColorScheme={true}
            attribute="class"
            disableTransitionOnChange={true}
        >
            {children}
        </NextThemeProvider>
    );
}
