"use client";

import { ThemeProvider as NextThemeProvider, useTheme } from "next-themes";
import { useServerInsertedHTML } from "next/navigation";
import React from "react";

/**
 * These IDs are only used in this file to ensure that the theme color
 * matches the local storage theme color value. This helps ensure that
 * even if the system theme is changed, the browser will use the forced
 * theme color value to render colors outside of the content that we control.
 *
 * This is relevant mainly to Safari because the browser window, and the background color
 * when the user "overscrolls", are controlled by the theme-color meta tag.
 *
 * Chrome doesn't necessarily use this, nor does Arc, which detects the color based on the first
 * pixel at the top of the viewport.
 */
const THEME_COLOR_PREFERENCE_LIGHT_ID = "fern-theme-color-preferred-light";
const THEME_COLOR_PREFERENCE_DARK_ID = "fern-theme-color-preferred-dark";
const THEME_COLOR_ID = "fern-theme-color";

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
            id={THEME_COLOR_PREFERENCE_LIGHT_ID}
            suppressHydrationWarning
            key={`__${THEME_COLOR_PREFERENCE_LIGHT_ID}`}
            name="theme-color"
            content={lightThemeColor}
            media="(prefers-color-scheme: light)"
          />
        )}
        {darkThemeColor && (
          <meta
            id={THEME_COLOR_PREFERENCE_DARK_ID}
            suppressHydrationWarning
            key={`__${THEME_COLOR_PREFERENCE_DARK_ID}`}
            name="theme-color"
            content={darkThemeColor}
            media="(prefers-color-scheme: dark)"
          />
        )}
        {currentThemeColor && (
          <meta
            id={THEME_COLOR_ID}
            suppressHydrationWarning
            key={`__${THEME_COLOR_ID}`}
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
      THEME_COLOR_PREFERENCE_LIGHT_ID
    );
    const prefersDark = document.getElementById(THEME_COLOR_PREFERENCE_DARK_ID);
    if (prefersLight) {
      prefersLight.parentNode?.removeChild(prefersLight);
    }
    if (prefersDark) {
      prefersDark.parentNode?.removeChild(prefersDark);
    }
  }, []);

  React.useEffect(() => {
    // Remove the theme color meta tag if it is not needed.
    const themeColorMeta = document.getElementById(THEME_COLOR_ID);
    if (themeColorMeta && themeColorMeta instanceof HTMLMetaElement) {
      themeColorMeta.content = currentThemeColor ?? "";
    }
  }, [currentThemeColor]);

  return null;
}
