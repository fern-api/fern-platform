"use server";

import Preload, { PreloadHref } from "@/components/preload";
import { createCachedDocsLoader } from "@/server/docs-loader";
import { RgbaColor } from "@/server/types";
import { DocsV2Read } from "@fern-api/fdr-sdk/client/types";
import { withDefaultProtocol } from "@fern-api/ui-core-utils";
import { FernTooltipProvider } from "@fern-docs/components";
import { getEdgeFlags, getSeoDisabled } from "@fern-docs/edge-config";
import { EdgeFlags } from "@fern-docs/utils";
import { compact } from "es-toolkit/array";
import { Provider as JotaiProvider } from "jotai/react";
import { Metadata, Viewport } from "next/types";
import tinycolor from "tinycolor2";
import "./globals.scss";
import StyledJsxRegistry from "./registry";
import { toImageDescriptor } from "./seo";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const docsLoader = await createCachedDocsLoader();
  const config = await docsLoader.getConfig();
  const edgeFlags = await getEdgeFlags(docsLoader.domain);
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css"
          rel="stylesheet"
          fetchPriority="low"
        />
        <Preload
          hrefs={generatePreloadHrefs(
            config?.typographyV2,
            await docsLoader.getFiles(),
            edgeFlags
          )}
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
  const docsLoader = await createCachedDocsLoader();
  const colors = await docsLoader.getColors();
  const dark = maybeToHex(
    colors.dark?.background ?? colors.dark?.accentPrimary
  );
  const light = maybeToHex(
    colors.light?.background ?? colors.light?.accentPrimary
  );
  return {
    width: "device-width",
    height: "device-height",
    initialScale: 1,
    maximumScale: 1,
    minimumScale: 1,
    userScalable: true,
    themeColor: compact([
      dark ? { color: dark, media: "(prefers-color-scheme: dark)" } : undefined,
      light
        ? { color: light, media: "(prefers-color-scheme: light)" }
        : undefined,
    ]),
  };
}

function maybeToHex(color: RgbaColor | undefined): string | undefined {
  if (color == null) {
    return undefined;
  }
  return tinycolor(color).toHexString();
}

export async function generateMetadata(): Promise<Metadata> {
  const docsLoader = await createCachedDocsLoader();
  const [files, config, baseUrl, isSeoDisabled] = await Promise.all([
    docsLoader.getFiles(),
    docsLoader.getConfig(),
    docsLoader.getBaseUrl(),
    getSeoDisabled(docsLoader.domain),
  ]);
  const noindex = isSeoDisabled || config?.metadata?.noindex || false;
  const nofollow = isSeoDisabled || config?.metadata?.nofollow || false;

  return {
    generator: "https://buildwithfern.com",
    metadataBase: new URL(
      baseUrl.basePath || "/",
      withDefaultProtocol(docsLoader.domain)
    ),
    applicationName: config?.title,
    title: {
      template: config?.title ? "%s | " + config?.title : "%s",
      default: config?.title ?? "Documentation",
    },
    robots: {
      index: !noindex,
      follow: !nofollow,
    },
    openGraph: {
      title: config?.metadata?.["og:title"],
      description: config?.metadata?.["og:description"],
      locale: config?.metadata?.["og:locale"],
      url: config?.metadata?.["og:url"],
      siteName: config?.metadata?.["og:site_name"],
      images: toImageDescriptor(
        files,
        config?.metadata?.["og:image"],
        config?.metadata?.["og:image:width"],
        config?.metadata?.["og:image:height"]
      ),
    },
    twitter: {
      site: config?.metadata?.["twitter:site"],
      creator: config?.metadata?.["twitter:handle"],
      title: config?.metadata?.["twitter:title"],
      description: config?.metadata?.["twitter:description"],
      images: toImageDescriptor(files, config?.metadata?.["twitter:image"]),
    },
    icons: {
      icon: config?.favicon
        ? toImageDescriptor(files, {
            type: "fileId",
            value: config.favicon,
          })?.url
        : undefined,
    },
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

  return toReturn;
}

function getFontExtension(url: string): string {
  const ext = new URL(url).pathname.split(".").pop();
  if (ext == null) {
    throw new Error("No extension found for font: " + url);
  }
  return ext;
}
