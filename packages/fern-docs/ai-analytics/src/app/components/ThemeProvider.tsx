"use client";

import { ThemeProvider as NextThemes } from "next-themes";
import { ReactNode } from "react";

export function NextThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemes attribute="class" defaultTheme="system" enableSystem>
      {children}
    </NextThemes>
  );
}
