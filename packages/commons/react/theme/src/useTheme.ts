import { useTheme as _useTheme } from "next-themes";
import { useEffect, useMemo } from "react";
import { type Theme } from "./theme";

interface UseThemeReturnType {
    theme: Theme | undefined;
    setTheme: (theme: Theme) => void;
}

export function useTheme(colorConfigType: "dark" | "light" | "darkAndLight"): UseThemeReturnType {
    const { setTheme, theme } = _useTheme();

    useEffect(() => {
        if (colorConfigType !== "darkAndLight") {
            setTheme(colorConfigType);
        }
    }, [colorConfigType, setTheme]);

    return useMemo(() => {
        if (colorConfigType !== "darkAndLight") {
            return { theme: colorConfigType, setTheme };
        }

        return { theme, setTheme } as UseThemeReturnType;
    }, [colorConfigType, setTheme, theme]);
}
