import { Metadata, Viewport } from "next/types";

import { TooltipProvider } from "@radix-ui/react-tooltip";
import { Provider as JotaiProvider } from "jotai/react";

import { Toaster } from "@fern-docs/components";

import { ConsoleMessage } from "@/components/console-message";

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
        <ConsoleMessage />
        <StyledJsxRegistry>
          <JotaiProvider>
            <TooltipProvider>
              <Toaster />
              {children}
            </TooltipProvider>
          </JotaiProvider>
        </StyledJsxRegistry>
      </body>
    </html>
  );
}

export const viewport: Viewport = {
  width: "device-width",
  height: "device-height",
  initialScale: 1,
  maximumScale: 1,
  minimumScale: 1,
  userScalable: true,
};

export const metadata: Metadata = {
  generator: "https://buildwithfern.com",
};
