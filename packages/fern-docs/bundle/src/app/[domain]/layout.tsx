import { Metadata, Viewport } from "next/types";
import React from "react";
import { preload } from "react-dom";

import { getEnv } from "@vercel/functions";
import { compact } from "es-toolkit/array";
import tinycolor from "tinycolor2";

import { DocsV1Read, DocsV2Read } from "@fern-api/fdr-sdk/client/types";
import { isNonNullish } from "@fern-api/ui-core-utils";
import {
  getCustomerAnalytics as deprecated_getCustomerAnalytics,
  getEdgeFlags,
  getLaunchDarklySettings,
  getSeoDisabled,
} from "@fern-docs/edge-config";

import { CustomerAnalytics } from "@/components/analytics/CustomerAnalytics";
import { BgImageGradient } from "@/components/components/BgImageGradient";
import { JavascriptProvider } from "@/components/components/JavascriptProvider";
import { withJsConfig } from "@/components/components/with-js-config";
import { FeatureFlagProvider } from "@/components/feature-flags/FeatureFlagProvider";
import SearchV2 from "@/components/search";
import { renderThemeStylesheet } from "@/components/themes/stylesheet/renderThemeStylesheet";
import { DocsLoader, createCachedDocsLoader } from "@/server/docs-loader";
import type { RgbaColor } from "@/server/types";
import { DarkCode } from "@/state/dark-code";
import { Domain } from "@/state/domain";
import { LaunchDarklyInfo } from "@/state/feature-flags";
import { DefaultLanguage } from "@/state/language";

import { GlobalStyles } from "../global-styles";
import { toImageDescriptor } from "../seo";
import { ThemeProvider } from "../theme";

export default async function Layout(props: {
  children: React.ReactNode;
  params: Promise<{ domain: string }>;
}) {
  const params = await props.params;

  const { children } = props;

  const domain = params.domain;
  const loader = await createCachedDocsLoader(domain);
  const [
    config,
    edgeFlags,
    files,
    colors,
    deprecated_customerAnalytics,
    launchDarkly,
  ] = await Promise.all([
    loader.getConfig(),
    getEdgeFlags(domain),
    loader.getFiles(),
    loader.getColors(),
    deprecated_getCustomerAnalytics(domain),
    getLaunchDarklyInfo(loader),
  ]);

  generatePreloadHrefs(config.typographyV2, files);
  const stylesheet = renderThemeStylesheet({
    colorsConfig: colors,
    typography: config.typographyV2,
    layoutConfig: config.layout,
    css: config.css,
    files,
    hasTabs: true, // todo: fix this
  });

  const { VERCEL_ENV } = getEnv();

  const jsConfig = withJsConfig(config.js, files);

  return (
    <ThemeProvider
      hasLight={Boolean(colors.light)}
      hasDark={Boolean(colors.dark)}
    >
      <Domain value={domain} />
      {config.defaultLanguage != null && (
        <DefaultLanguage language={config.defaultLanguage} />
      )}
      <DarkCode value={edgeFlags.isDarkCodeEnabled} />
      {/* <FernUser domain={domain} fern_token={fern_token} /> */}
      <BgImageGradient colors={colors} />
      <GlobalStyles>{`
        :root {
          ${domain.includes("nominal") ? "--radius: 0px;" : ""}
        }


        ${stylesheet}
      `}</GlobalStyles>
      <FeatureFlagProvider featureFlagsConfig={{ launchDarkly }}>
        {children}
      </FeatureFlagProvider>
      <React.Suspense fallback={null}>
        <SearchV2 domain={domain} isAskAiEnabled={edgeFlags.isAskAiEnabled} />
      </React.Suspense>
      {jsConfig != null && <JavascriptProvider config={jsConfig} />}
      {VERCEL_ENV === "production" && (
        <CustomerAnalytics
          config={mergeCustomerAnalytics(
            deprecated_customerAnalytics,
            config.analyticsConfig
          )}
        />
      )}
    </ThemeProvider>
  );
}

// TODO: delete this once we've migrated all customers to the new analytics config
function mergeCustomerAnalytics(
  deprecated_customerAnalytics: Awaited<
    ReturnType<typeof deprecated_getCustomerAnalytics>
  >,
  config: DocsV1Read.AnalyticsConfig | undefined
): Partial<DocsV1Read.AnalyticsConfig> {
  return {
    ga4: deprecated_customerAnalytics?.ga4?.measurementId
      ? { measurementId: deprecated_customerAnalytics.ga4.measurementId }
      : undefined,
    gtm: deprecated_customerAnalytics?.gtm?.tagId
      ? { containerId: deprecated_customerAnalytics.gtm.tagId }
      : undefined,
    ...config,
  };
}

async function getLaunchDarklyInfo(
  loader: DocsLoader
): Promise<LaunchDarklyInfo | undefined> {
  const unstable_launchDarklySettings = await getLaunchDarklySettings(
    loader.domain,
    loader.getMetadata().then((metadata) => metadata.org)
  );
  if (!unstable_launchDarklySettings) {
    return undefined;
  }

  return {
    clientSideId: unstable_launchDarklySettings["client-side-id"],
    contextEndpoint: unstable_launchDarklySettings["context-endpoint"],
    context: undefined,
    defaultFlags: undefined,
    options: {
      baseUrl: unstable_launchDarklySettings.options?.["base-url"],
      streamUrl: unstable_launchDarklySettings.options?.["stream-url"],
      eventsUrl: unstable_launchDarklySettings.options?.["events-url"],
      hash: undefined,
    },
  };
}

export async function generateViewport(props: {
  params: Promise<{ domain: string }>;
}): Promise<Viewport> {
  const { domain } = await props.params;

  const loader = await createCachedDocsLoader(domain);
  const colors = await loader.getColors();
  const dark = maybeToHex(
    colors.dark?.background ?? colors.dark?.accentPrimary
  );
  const light = maybeToHex(
    colors.light?.background ?? colors.light?.accentPrimary
  );
  return {
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

export async function generateMetadata(props: {
  params: Promise<{ domain: string }>;
}): Promise<Metadata> {
  const { domain } = await props.params;

  const loader = await createCachedDocsLoader(domain);
  const [files, config, seoDisabled] = await Promise.all([
    loader.getFiles(),
    loader.getConfig(),
    getSeoDisabled(domain),
  ]);

  let index = config.metadata?.noindex ? false : undefined;
  let follow = config.metadata?.nofollow ? false : undefined;
  if (seoDisabled) {
    index = false;
    follow = false;
  }

  return {
    applicationName: config.title,
    title: {
      template: config.title ? "%s | " + config.title : "%s",
      default: config.title ?? "Documentation",
    },
    robots: { index, follow },
    openGraph: {
      title: config.metadata?.["og:title"],
      description: config.metadata?.["og:description"],
      locale: config.metadata?.["og:locale"],
      url: config.metadata?.["og:url"],
      siteName: config.metadata?.["og:site_name"],
      images: toImageDescriptor(
        files,
        config.metadata?.["og:image"],
        config.metadata?.["og:image:width"],
        config.metadata?.["og:image:height"]
      ),
    },
    twitter: {
      site: config.metadata?.["twitter:site"],
      creator: config.metadata?.["twitter:handle"],
      title: config.metadata?.["twitter:title"],
      description: config.metadata?.["twitter:description"],
      images: toImageDescriptor(files, config.metadata?.["twitter:image"]),
    },
    icons: {
      icon: config.favicon
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
  files: Record<string, { src: string }>
): void {
  compact([
    typography?.bodyFont?.variants,
    typography?.headingsFont?.variants,
    typography?.codeFont?.variants,
  ])
    .flat()
    .map((variant) => files[variant.fontFile]?.src)
    .filter(isNonNullish)
    .forEach((src) => {
      try {
        preload(src, {
          as: "font",
          crossOrigin: "anonymous",
          type: `font/${getFontExtension(src)}`,
          fetchPriority: "high",
        });
      } catch {}
    });
}

function getFontExtension(url: string): string {
  const ext = new URL(url).pathname.split(".").pop();
  if (ext == null) {
    throw new Error("No extension found for font: " + url);
  }
  return ext;
}
