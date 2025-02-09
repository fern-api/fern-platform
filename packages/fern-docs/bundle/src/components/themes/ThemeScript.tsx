"use client";

import { ColorsThemeConfig } from "@/server/types";
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

const getAvailableThemes = (
  colors: {
    dark?: ColorsThemeConfig;
    light?: ColorsThemeConfig;
  } = {}
): AvailableThemes => {
  if (Boolean(colors.dark) === Boolean(colors.light)) {
    return ["light", "dark"];
  }

  return colors.dark ? ["dark"] : ["light"];
};

export function ThemeScript({
  colors,
}: {
  colors?: {
    dark?: ColorsThemeConfig;
    light?: ColorsThemeConfig;
  };
}): ReactElement<any> {
  const args = getAvailableThemes(colors);
  return (
    // eslint-disable-next-line @next/next/no-before-interactive-script-outside-document
    (<Script
      id="theme-script"
      dangerouslySetInnerHTML={{
        __html: `(${script.toString()})(${JSON.stringify(args)})`,
      }}
      strategy="beforeInteractive"
    />)
  );
}
