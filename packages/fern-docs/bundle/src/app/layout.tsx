"use server";

import { CustomerAnalytics } from "@/components/analytics/CustomerAnalytics";
import Preload, { PreloadHref } from "@/components/preload";
import { renderThemeStylesheet } from "@/components/themes/stylesheet/renderThemeStylesheet";
import { ThemeScript } from "@/components/themes/ThemeScript";
import { createCachedDocsLoader } from "@/server/docs-loader";
import { getDocsDomainApp } from "@/server/xfernhost/app";
import { DocsV2Read } from "@fern-api/fdr-sdk/client/types";
import { withDefaultProtocol } from "@fern-api/ui-core-utils";
import { FernTooltipProvider, Toaster } from "@fern-docs/components";
import { getEdgeFlags, getSeoDisabled } from "@fern-docs/edge-config";
import { EdgeFlags } from "@fern-docs/utils";
import { compact, uniqBy } from "es-toolkit/array";
import { Provider as JotaiProvider } from "jotai/react";
import { Metadata, Viewport } from "next/types";
import { GlobalStyles } from "./(docs)/global-styles";
import "./globals.scss";
import StyledJsxRegistry from "./registry";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const domain = getDocsDomainApp();
  const docsLoader = await createCachedDocsLoader(domain);
  const [config, edgeFlags, files, colors] = await Promise.all([
    docsLoader.getConfig(),
    getEdgeFlags(domain),
    docsLoader.getFiles(),
    docsLoader.getColors(),
  ]);
  const preloadHrefs = generatePreloadHrefs(
    config?.typographyV2,
    files,
    edgeFlags
  );
  const stylesheet = renderThemeStylesheet(
    colors,
    config?.typographyV2,
    config?.layout,
    config?.css,
    files,
    true // todo: fix this
  );
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css"
          rel="stylesheet"
          fetchPriority="low"
        />

        {preloadHrefs.map((href) => (
          <Preload key={href.href} href={href.href} options={href.options} />
        ))}
      </head>
      <body className="antialiased">
        <StyledJsxRegistry>
          <GlobalStyles>{stylesheet}</GlobalStyles>
          <ThemeScript colors={colors} />
          <Toaster />
          <JotaiProvider>
            <FernTooltipProvider>
              {children}
              <CustomerAnalytics />
            </FernTooltipProvider>
          </JotaiProvider>
        </StyledJsxRegistry>
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

function generatePreloadHrefs(
  typography: DocsV2Read.LoadDocsForUrlResponse["definition"]["config"]["typographyV2"],
  files: Record<string, { src: string }>,
  edgeFlags: EdgeFlags
): PreloadHref[] {
  const toReturn: PreloadHref[] = [];

  const fontVariants = compact([
    typography?.bodyFont?.variants,
    typography?.headingsFont?.variants,
    typography?.codeFont?.variants,
  ]).flat();

  fontVariants.forEach((variant) => {
    try {
      const file = files[variant.fontFile];
      if (file != null) {
        toReturn.push({
          href: file.src,
          options: {
            as: "font",
            crossOrigin: "anonymous",
            type: `font/${getFontExtension(file.src)}`,
          },
        });
      }
    } catch {}
  });

  if (edgeFlags.isApiPlaygroundEnabled) {
    toReturn.push({
      href: "/api/fern-docs/auth/api-key-injection",
      options: { as: "fetch" },
    });
  }

  toReturn.push({
    href: edgeFlags.isSearchV2Enabled
      ? "/api/fern-docs/search/v2/key"
      : "/api/fern-docs/search/v1/key",
    options: { as: "fetch" },
  });

  return uniqBy(toReturn, (href) => href.href);
}

function getFontExtension(url: string): string {
  const ext = new URL(url).pathname.split(".").pop();
  if (ext == null) {
    throw new Error("No extension found for font: " + url);
  }
  return ext;
}
