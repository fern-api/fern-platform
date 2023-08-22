import { useTheme as _useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { DEFAULT_THEME, type Theme } from "./theme";

interface UseThemeReturnType {
    theme: Theme | undefined;
    setTheme: (theme: Theme) => void;
}

export function useTheme(lightModeEnabled: boolean): UseThemeReturnType {
    const [mounted, setMounted] = useState(false);
    const { setTheme, theme } = _useTheme();

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!lightModeEnabled) {
        return { theme: DEFAULT_THEME, setTheme };
    }

    if (!mounted) {
        return { theme: undefined, setTheme };
    }

    return { theme: theme ?? DEFAULT_THEME, setTheme } as UseThemeReturnType;
}
