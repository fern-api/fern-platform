import { useTheme as _useTheme } from "next-themes";
import { useEffect, useMemo, useState } from "react";
import { type Theme } from "./theme";

interface UseThemeReturnType {
    theme: Theme | undefined;
    setTheme: (theme: Theme) => void;
}

export function useTheme(colorConfigType: "dark" | "light" | "darkAndLight"): UseThemeReturnType {
    const [mounted, setMounted] = useState(false);
    const { setTheme, theme } = _useTheme();

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (colorConfigType !== "darkAndLight") {
            setTheme(colorConfigType);
        }
    }, [colorConfigType, setTheme]);

    return useMemo(() => {
        if (colorConfigType !== "darkAndLight") {
            return { theme: colorConfigType, setTheme };
        }

        if (!mounted) {
            return { theme: undefined, setTheme };
        }

        return { theme, setTheme } as UseThemeReturnType;
    }, [colorConfigType, mounted, setTheme, theme]);
}
