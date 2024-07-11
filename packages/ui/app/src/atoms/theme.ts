import { noop } from "@fern-ui/core-utils";
import { ColorsConfig } from "@fern-ui/fdr-utils";
import { atom, useAtom, useAtomValue } from "jotai";
import { atomWithRefresh, atomWithStorage } from "jotai/utils";
import { getThemeColor } from "../next-app/utils/getColorVariables";

const disableAnimation = () => {
    if (typeof document === "undefined") {
        return noop;
    }

    const css = document.createElement("style");
    css.appendChild(
        document.createTextNode(
            "*,*::before,*::after{-webkit-transition:none!important;-moz-transition:none!important;-o-transition:none!important;-ms-transition:none!important;transition:none!important}",
        ),
    );
    document.head.appendChild(css);

    return () => {
        // Force restyle
        (() => window.getComputedStyle(document.body))();

        // Wait for next tick before removing
        setTimeout(() => {
            document.head.removeChild(css);
        }, 1);
    };
};

const SETTABLE_THEME_ATOM = atomWithStorage<"dark" | "light" | "system">("theme", "system");

export const COLORS_ATOM = atom<ColorsConfig>({
    dark: undefined,
    light: undefined,
});

export function useColors(): ColorsConfig {
    return useAtomValue(COLORS_ATOM);
}

export const THEME_SWITCH_ENABLED_ATOM = atom((get) => {
    const colors = get(COLORS_ATOM);
    return colors.dark != null && colors.light != null;
});

export const THEME_ATOM = atomWithRefresh(
    (get): "dark" | "light" => {
        const storedTheme = get(SETTABLE_THEME_ATOM);
        const colors = get(COLORS_ATOM);
        let theme: "dark" | "light" = colors.light != null ? "light" : colors.dark != null ? "dark" : "light";
        if (storedTheme === "system") {
            if (typeof window !== "undefined") {
                return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
            }
        } else if (colors[storedTheme] != null) {
            theme = storedTheme;
        }
        return theme;
    },
    (_get, set, theme: "dark" | "light" | "system") => {
        const enable = disableAnimation();
        set(SETTABLE_THEME_ATOM, theme);
        enable();
    },
);

export function useTheme(): ["dark" | "light", setTheme: (theme: "dark" | "light" | "system") => void] {
    return useAtom(THEME_ATOM);
}

export const THEME_BG_COLOR = atom((get) => {
    const theme = get(THEME_ATOM);
    const colors = get(COLORS_ATOM);
    const config = colors[theme];
    if (config == null) {
        return undefined;
    }
    return getThemeColor(config);
});
