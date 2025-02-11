"use client";

import Script from "next/script";
import type { ReactElement } from "react";

import type { AvailableThemes } from "../atoms";

// this script cannot reference any other code since it will be stringified to be executed in the browser
const script = (themes: AvailableThemes): void => {
  const el = document.documentElement;

  function updateDOM(theme: string) {
    el.classList.remove("light", "dark");
    el.classList.add(theme);
    el.style.colorScheme = theme;
  }

  function getSystemTheme() {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  if (themes.length === 1) {
    updateDOM(themes[0]);
  } else {
    try {
      const themeName = localStorage.getItem("theme") ?? "system";
      const isSystem = themes.length > 0 && themeName === "system";
      const theme = isSystem ? getSystemTheme() : themeName;
      updateDOM(theme);
    } catch {
      //
    }
  }
};

const getAvailableThemes = (dark: boolean, light: boolean): AvailableThemes => {
  if (dark === light) {
    return ["light", "dark"];
  }

  return dark ? ["dark"] : ["light"];
};

export function ThemeScript({
  dark,
  light,
}: {
  dark: boolean;
  light: boolean;
}): ReactElement<any> {
  const args = getAvailableThemes(dark, light);
  return (
    // eslint-disable-next-line @next/next/no-before-interactive-script-outside-document
    <Script
      id="theme-script"
      dangerouslySetInnerHTML={{
        __html: `(${script.toString()})(${JSON.stringify(args)})`,
      }}
      strategy="beforeInteractive"
      suppressHydrationWarning
    />
  );
}
