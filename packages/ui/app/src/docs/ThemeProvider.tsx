import { ColorsConfig } from "@fern-ui/fdr-utils";
import { PropsWithChildren, ReactElement, memo } from "react";
import { useCallbackOne } from "use-memo-one";
import { THEME_ATOM } from "../atoms/theme";
import { useAtomEffect } from "../hooks/useAtomEffect";

interface ThemeProviderProps {
    colors?: ColorsConfig | undefined;
}

export const ThemeProvider = memo(({ children }: PropsWithChildren<ThemeProviderProps>): ReactElement => {
    // NextThemeProvider is not stable, and needs to be included in `_app.tsx` to work properly.
    // docs-bundle uses static props to pass in the colors, whereas local-preview-bundle uses a hook.

    useAtomEffect(
        useCallbackOne((get) => {
            const theme = get(THEME_ATOM);
            const d = document.documentElement;
            if (theme === "dark") {
                d.classList.add("dark");
                d.classList.remove("light");
            } else {
                d.classList.remove("dark");
                d.classList.add("light");
            }
        }, []),
    );

    return <>{children}</>;
});

ThemeProvider.displayName = "ThemeProvider";
