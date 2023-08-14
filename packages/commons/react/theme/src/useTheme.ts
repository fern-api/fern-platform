import { useTheme as _useTheme } from "next-themes";
import { type Theme } from "./theme";

interface UseThemeReturnType {
    theme: Theme | undefined;
    setTheme: (theme: Theme) => void;
}

export function useTheme(): UseThemeReturnType {
    const { setTheme, theme } = _useTheme();
    return { theme, setTheme } as UseThemeReturnType;
}
