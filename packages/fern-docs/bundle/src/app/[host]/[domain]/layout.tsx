import "server-only";

import { Metadata } from "next/types";
import React from "react";
import { preload } from "react-dom";

import { getEnv } from "@vercel/functions";
import { compact } from "es-toolkit/array";

import { DocsV1Read, DocsV2Read } from "@fern-api/fdr-sdk/client/types";
import { isNonNullish } from "@fern-api/ui-core-utils";
import {
  getCustomerAnalytics as deprecated_getCustomerAnalytics,
  getEdgeFlags,
  getLaunchDarklySettings,
  getSeoDisabled,
} from "@fern-docs/edge-config";

import { JavascriptProvider } from "@/components/JavascriptProvider";
import { CustomerAnalytics } from "@/components/analytics/CustomerAnalytics";
import { ErrorBoundary } from "@/components/error-boundary";
import { FeatureFlagProvider } from "@/components/feature-flags/FeatureFlagProvider";
import { FernUser } from "@/components/fern-user";
import SearchV2 from "@/components/search";
import { withJsConfig } from "@/components/with-js-config";
import { DocsLoader, createCachedDocsLoader } from "@/server/docs-loader";
import { SetColors } from "@/state/colors";
import { DarkCode } from "@/state/dark-code";
import { Domain } from "@/state/domain";
import { LaunchDarklyInfo } from "@/state/feature-flags";
import { DefaultLanguage } from "@/state/language";
import { RootNodeProvider } from "@/state/navigation";
import {
  getAllSidebarRootNodes,
  getSidebarRootNodeIdToChildToParentsMap,
} from "@/state/navigation-server";
import { Whitelabeled } from "@/state/whitelabeled";

import { GlobalStyles } from "../../global-styles";
import { toImageDescriptor } from "../../seo";
import { ThemeProvider } from "../../theme";

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ host: string; domain: string }>;
}) {
  const { host, domain } = await params;

  const loader = await createCachedDocsLoader(host, domain);
  const [
    config,
    unsafe_fullRoot,
    edgeFlags,
    files,
    colors,
    layout,
    fonts,
    deprecated_customerAnalytics,
    launchDarkly,
  ] = await Promise.all([
    loader.getConfig(),
    loader.unsafe_getFullRoot(),
    getEdgeFlags(domain),
    loader.getFiles(),
    loader.getColors(),
    loader.getLayout(),
    loader.getFonts(),
    deprecated_getCustomerAnalytics(domain),
    getLaunchDarklyInfo(loader),
  ]);

  generatePreloadHrefs(config.typographyV2, files);

  const { VERCEL_ENV } = getEnv();

  const jsConfig = withJsConfig(config.js, files);

  // this creates a safe id mapping, so we can send it to the client:
  const sidebarRootNodes = getAllSidebarRootNodes(unsafe_fullRoot);
  const sidebarRootNodesToChildToParentsMap =
    getSidebarRootNodeIdToChildToParentsMap(sidebarRootNodes);

  return (
    <ThemeProvider
      hasLight={Boolean(colors.light)}
      hasDark={Boolean(colors.dark)}
      lightThemeColor={colors.light?.themeColor}
      darkThemeColor={colors.dark?.themeColor}
    >
      <RootNodeProvider
        sidebarRootNodesToChildToParentsMap={
          sidebarRootNodesToChildToParentsMap
        }
      >
        <Domain value={domain} />
        {config.defaultLanguage != null && (
          <DefaultLanguage language={config.defaultLanguage} />
        )}
        <DarkCode value={edgeFlags.isDarkCodeEnabled} />
        <Whitelabeled value={edgeFlags.isWhitelabeled} />
        <SetColors colors={colors} />
        <FernUser domain={domain} host={host} />
        <GlobalStyles
          domain={domain}
          layout={layout}
          fonts={fonts}
          light={colors.light}
          dark={colors.dark}
          inlineCss={config.css?.inline}
        />
        <FeatureFlagProvider featureFlagsConfig={{ launchDarkly }}>
          {children}
        </FeatureFlagProvider>
        <ErrorBoundary>
          <React.Suspense fallback={null}>
            <SearchV2
              domain={domain}
              isAskAiEnabled={edgeFlags.isAskAiEnabled}
            />
          </React.Suspense>
        </ErrorBoundary>
        {jsConfig != null && <JavascriptProvider config={jsConfig} />}
        {VERCEL_ENV === "production" && (
          <CustomerAnalytics
            config={mergeCustomerAnalytics(
              deprecated_customerAnalytics,
              config.analyticsConfig
            )}
          />
        )}
      </RootNodeProvider>
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

export async function generateMetadata(props: {
  params: Promise<{ host: string; domain: string }>;
}): Promise<Metadata> {
  const { host, domain } = await props.params;

  const loader = await createCachedDocsLoader(host, domain);
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
      default: "Documentation",
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
