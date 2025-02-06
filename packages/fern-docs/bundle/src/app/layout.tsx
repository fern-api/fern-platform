"use server";

import { getDocsDomainApp } from "@/server/xfernhost/app";
import { withDefaultProtocol } from "@fern-api/ui-core-utils";
import { FernTooltipProvider } from "@fern-docs/components";
import { getSeoDisabled } from "@fern-docs/edge-config";
import { Provider as JotaiProvider } from "jotai/react";
import { Metadata, Viewport } from "next/types";
import "./globals.scss";
import StyledJsxRegistry from "./registry";

export default async function DashboardLayout({
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
        <JotaiProvider>
          <StyledJsxRegistry>
            <FernTooltipProvider>{children}</FernTooltipProvider>
          </StyledJsxRegistry>
        </JotaiProvider>
      </body>
    </html>
  );
}

export async function generateViewport(): Promise<Viewport> {
  return {
    width: "device-width",
    height: "device-height",
    initialScale: 1,
    maximumScale: 1,
    minimumScale: 1,
    userScalable: true,
  };
}

export async function generateMetadata(): Promise<Metadata> {
  const domain = getDocsDomainApp();
  const seoEnabled = !getSeoDisabled(domain);

  return {
    generator: "https://buildwithfern.com",
    metadataBase: new URL("/", withDefaultProtocol(domain)),
    robots: { index: seoEnabled, follow: seoEnabled },
  };
}
