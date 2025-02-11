import { ThemeProvider as NextThemeProvider } from "next-themes";

export function ThemeProvider({
  children,
  hasLight,
  hasDark,
}: {
  children: React.ReactNode;
  hasLight: boolean;
  hasDark: boolean;
}) {
  const enableSystem = hasLight === hasDark;
  const forcedTheme = enableSystem
    ? undefined
    : hasLight
      ? "light"
      : hasDark
        ? "dark"
        : undefined;

  return (
    <NextThemeProvider
      forcedTheme={forcedTheme}
      defaultTheme={forcedTheme ?? "system"}
      enableSystem={enableSystem}
      disableTransitionOnChange
      attribute="class"
    >
      {children}
    </NextThemeProvider>
  );
}
