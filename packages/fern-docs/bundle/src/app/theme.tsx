import { ThemeProvider as NextThemeProvider } from "next-themes";

import { ThemeMetaTag } from "@/components/sidebar/theme-switch";

export function ThemeProvider({
  children,
  hasLight,
  hasDark,
  lightThemeColor,
  darkThemeColor,
}: {
  children: React.ReactNode;
  hasLight: boolean;
  hasDark: boolean;
  lightThemeColor?: string;
  darkThemeColor?: string;
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
      <ThemeMetaTag light={lightThemeColor} dark={darkThemeColor} />
      {children}
    </NextThemeProvider>
  );
}
