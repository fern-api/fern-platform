"use client";

import { store } from "@/components/atoms";
import { FernTooltipProvider } from "@fern-docs/components";
import { Provider as JotaiProvider } from "jotai/react";
import "./globals.scss";
import StyledJsxRegistry from "./registry";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css"
          rel="stylesheet"
          fetchPriority="low"
        />
      </head>
      <body className="antialiased">
        <JotaiProvider store={store}>
          <StyledJsxRegistry>
            <FernTooltipProvider>{children}</FernTooltipProvider>
          </StyledJsxRegistry>
        </JotaiProvider>
      </body>
    </html>
  );
}
