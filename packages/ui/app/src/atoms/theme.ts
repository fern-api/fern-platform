import { ColorsConfig } from "@fern-ui/fdr-utils";
import { isEqual } from "es-toolkit/predicate";
import { atom, useAtom, useAtomValue } from "jotai";
import { atomWithRefresh, selectAtom } from "jotai/utils";
import { noop } from "ts-essentials";
import { useCallbackOne } from "use-memo-one";
import { z } from "zod";
import { getThemeColor } from "../themes/stylesheet/getColorVariables";
import { DOCS_ATOM } from "./docs";
import { useAtomEffect } from "./hooks/useAtomEffect";
import { atomWithStorageString } from "./utils/atomWithStorageString";

const STORAGE_KEY = "theme";
const SYSTEM = "system" as const;
const SYSTEM_THEMES = ["light" as const, "dark" as const];
const MEDIA = "(prefers-color-scheme: dark)";

type Theme = (typeof SYSTEM_THEMES)[number];

const SETTABLE_THEME_ATOM = atomWithStorageString<Theme | typeof SYSTEM>(STORAGE_KEY, SYSTEM, {
    validate: z.union([z.literal("system"), z.literal("light"), z.literal("dark")]),
    getOnInit: true,
});
SETTABLE_THEME_ATOM.debugLabel = "SETTABLE_THEME_ATOM";

const IS_SYSTEM_THEME_ATOM = atom((get) => get(SETTABLE_THEME_ATOM) === SYSTEM);
IS_SYSTEM_THEME_ATOM.debugLabel = "IS_SYSTEM_THEME_ATOM";

export const COLORS_ATOM = selectAtom(DOCS_ATOM, (docs) => docs.colors, isEqual);
COLORS_ATOM.debugLabel = "COLORS_ATOM";

export const AVAILABLE_THEMES_ATOM = atom((get) => getAvailableThemes(get(COLORS_ATOM)));
AVAILABLE_THEMES_ATOM.debugLabel = "AVAILABLE_THEMES_ATOM";

export function useColors(): Partial<ColorsConfig> {
    return useAtomValue(COLORS_ATOM);
}

export const THEME_SWITCH_ENABLED_ATOM = atom((get) => {
    const availableThemes = get(AVAILABLE_THEMES_ATOM);
    return availableThemes.length > 1;
});
THEME_SWITCH_ENABLED_ATOM.debugLabel = "THEME_SWITCH_ENABLED_ATOM";

export const THEME_ATOM = atomWithRefresh(
    (get): Theme => {
        const storedTheme = get(SETTABLE_THEME_ATOM);
        const availableThemes = get(AVAILABLE_THEMES_ATOM);
        if (availableThemes.length === 1) {
            return availableThemes[0];
        } else if (storedTheme === SYSTEM) {
            if (typeof window !== "undefined") {
                return getSystemTheme();
            }
        } else {
            return storedTheme;
        }
        return availableThemes[0];
    },
    (_get, set, theme: Theme | typeof SYSTEM) => {
        set(SETTABLE_THEME_ATOM, theme);
    },
);

export function useTheme(): Theme {
    return useAtomValue(THEME_ATOM);
}

export function useSetTheme(): (theme: Theme | typeof SYSTEM) => void {
    return useAtom(SETTABLE_THEME_ATOM)[1];
}

export function useToggleTheme(): () => void {
    const setTheme = useSetTheme();
    const theme = useTheme();
    return () => setTheme(theme === "dark" ? "light" : "dark");
}

export function useSetSystemTheme(): () => void {
    const setTheme = useSetTheme();
    return () => setTheme(SYSTEM);
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
THEME_BG_COLOR.debugLabel = "THEME_BG_COLOR";

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

export type AvailableThemes = [Theme] | [Theme, Theme];
const getAvailableThemes = (colors: Partial<ColorsConfig> = {}): AvailableThemes => {
    if ((colors.dark != null && colors.light != null) || (colors.dark == null && colors.light == null)) {
        return ["light", "dark"];
    }
    return colors.dark != null ? ["dark"] : ["light"];
};

const getSystemTheme = (e?: MediaQueryList | MediaQueryListEvent) => {
    if (!e) {
        e = window.matchMedia(MEDIA);
    }
    const isDark = e.matches;
    const systemTheme = isDark ? "dark" : "light";
    return systemTheme;
};

export function useInitializeTheme(): void {
    useAtomEffect(
        useCallbackOne((get) => {
            const enableAnimation = disableAnimation();
            const theme = get(THEME_ATOM);
            const d = document.documentElement;
            d.classList.remove(...SYSTEM_THEMES);
            d.classList.add(theme);
            d.style.colorScheme = theme;
            enableAnimation();
        }, []),
    );

    useAtomEffect(
        useCallbackOne((get, set) => {
            const handleMediaQuery = () => {
                if (get.peek(IS_SYSTEM_THEME_ATOM)) {
                    set(THEME_ATOM);
                }
            };

            const media = window.matchMedia(MEDIA);

            // Intentionally use deprecated listener methods to support iOS & old browsers
            // eslint-disable-next-line deprecation/deprecation
            media.addListener(handleMediaQuery);
            handleMediaQuery();

            // eslint-disable-next-line deprecation/deprecation
            return () => media.removeListener(handleMediaQuery);
        }, []),
    );
}
