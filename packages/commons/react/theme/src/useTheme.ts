import { useTheme as _useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { type Theme } from "./theme";

interface UseThemeReturnType {
    theme: Theme | undefined;
    setTheme: (theme: Theme) => void;
}

export function useTheme(): UseThemeReturnType {
    const [mounted, setMounted] = useState(false);
    const { setTheme, theme } = _useTheme();

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return { theme: undefined, setTheme };
    }

    return { theme, setTheme } as UseThemeReturnType;
}
