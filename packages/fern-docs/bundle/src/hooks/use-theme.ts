import { useTheme } from "next-themes";

export function useThemeSwitchEnabled() {
  const { forcedTheme } = useTheme();
  return forcedTheme == null;
}

const allowlist = ["light", "dark"];

export function useResolvedTheme() {
  const { resolvedTheme } = useTheme();
  if (resolvedTheme && allowlist.includes(resolvedTheme)) {
    return resolvedTheme as "light" | "dark";
  }
  return "light";
}

export function useSetTheme() {
  const { setTheme } = useTheme();
  return (theme: "light" | "dark" | "system") => {
    setTheme(theme);
  };
}
