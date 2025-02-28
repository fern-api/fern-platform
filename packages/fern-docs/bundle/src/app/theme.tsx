"use client";

import { ThemeProvider as NextThemeProvider, useTheme } from "next-themes";
import { useServerInsertedHTML } from "next/navigation";
import React from "react";

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
      <ThemeColorStyle
        lightThemeColor={lightThemeColor}
        darkThemeColor={darkThemeColor}
      />
      {children}
    </NextThemeProvider>
  );
}

function ThemeColorStyle({
  lightThemeColor,
  darkThemeColor,
}: {
  lightThemeColor?: string;
  darkThemeColor?: string;
}) {
  const { resolvedTheme } = useTheme();
  const inserted = React.useRef(false);
  const currentThemeColor =
    resolvedTheme === "dark"
      ? (darkThemeColor ?? lightThemeColor)
      : (lightThemeColor ?? darkThemeColor);
  useServerInsertedHTML(() => {
    if (inserted.current) return null;
    inserted.current = true;
    return (
      <React.Fragment key="__fern-inserted-theme-colors">
        {lightThemeColor && (
          <meta
            id="fern-theme-color-preferred-light"
            suppressHydrationWarning
            key="__fern-theme-color-preferred-light"
            name="theme-color"
            content={lightThemeColor}
            media="(prefers-color-scheme: light)"
          />
        )}
        {darkThemeColor && (
          <meta
            id="fern-theme-color-preferred-dark"
            suppressHydrationWarning
            key="__fern-theme-color-preferred-dark"
            name="theme-color"
            content={darkThemeColor}
            media="(prefers-color-scheme: dark)"
          />
        )}
        {currentThemeColor && (
          <meta
            id="fern-theme-color"
            suppressHydrationWarning
            key="__fern-theme-color"
            name="theme-color"
            content={currentThemeColor}
          />
        )}
      </React.Fragment>
    );
  });

  React.useEffect(() => {
    // Remove the theme color preferred meta tags if they are not needed.
    const prefersLight = document.getElementById(
      "fern-theme-color-preferred-light"
    );
    const prefersDark = document.getElementById(
      "fern-theme-color-preferred-dark"
    );
    if (prefersLight) {
      prefersLight.parentNode?.removeChild(prefersLight);
    }
    if (prefersDark) {
      prefersDark.parentNode?.removeChild(prefersDark);
    }
  }, []);

  React.useEffect(() => {
    // Remove the theme color meta tag if it is not needed.
    const themeColorMeta = document.getElementById("fern-theme-color");
    if (themeColorMeta && themeColorMeta instanceof HTMLMetaElement) {
      themeColorMeta.content = currentThemeColor ?? "";
    }
  }, [currentThemeColor]);

  return null;
}
