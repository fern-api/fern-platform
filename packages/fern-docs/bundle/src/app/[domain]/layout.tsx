import { CustomerAnalytics } from "@/components/analytics/CustomerAnalytics";
import Preload, { PreloadHref } from "@/components/preload";
import { renderThemeStylesheet } from "@/components/themes/stylesheet/renderThemeStylesheet";
import { ThemeScript } from "@/components/themes/ThemeScript";
import { createCachedDocsLoader } from "@/server/docs-loader";
import { RgbaColor } from "@/server/types";
import { DocsV2Read } from "@fern-api/fdr-sdk/client/types";
import { withDefaultProtocol } from "@fern-api/ui-core-utils";
import { getEdgeFlags, getSeoDisabled } from "@fern-docs/edge-config";
import { EdgeFlags } from "@fern-docs/utils";
import { compact, uniqBy } from "es-toolkit/array";
import { cookies } from "next/headers";
import { Metadata, Viewport } from "next/types";
import tinycolor from "tinycolor2";
import { GlobalStyles } from "../global-styles";
import { toImageDescriptor } from "../seo";

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { domain: string };
}) {
  const domain = params.domain;
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
    <>
      {preloadHrefs.map((href) => (
        <Preload key={href.href} href={href.href} options={href.options} />
      ))}
      <GlobalStyles>{stylesheet}</GlobalStyles>
      <ThemeScript colors={colors} />
      {children}
      <CustomerAnalytics />
    </>
  );
}

export async function generateViewport({
  params,
}: {
  params: { domain: string };
}): Promise<Viewport> {
  const domain = params.domain;
  const docsLoader = await createCachedDocsLoader(domain);
  const colors = await docsLoader.getColors();
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

export async function generateMetadata({
  params,
}: {
  params: { domain: string };
}): Promise<Metadata> {
  const domain = params.domain;
  const fern_token = cookies().get("fern_token")?.value;
  const docsLoader = await createCachedDocsLoader(domain, fern_token);
  const [files, config, baseUrl, seoDisabled] = await Promise.all([
    docsLoader.getFiles(),
    docsLoader.getConfig(),
    docsLoader.getBaseUrl(),
    getSeoDisabled(domain),
  ]);

  let index = config?.metadata?.noindex ? false : undefined;
  let follow = config?.metadata?.nofollow ? false : undefined;
  if (seoDisabled) {
    index = false;
    follow = false;
  }

  return {
    metadataBase: new URL(
      baseUrl.basePath || "/",
      withDefaultProtocol(docsLoader.domain)
    ),
    applicationName: config?.title,
    title: {
      template: config?.title ? "%s | " + config?.title : "%s",
      default: config?.title ?? "Documentation",
    },
    robots: { index, follow },
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

  return uniqBy(toReturn, (href) => href.href);
}

function getFontExtension(url: string): string {
  const ext = new URL(url).pathname.split(".").pop();
  if (ext == null) {
    throw new Error("No extension found for font: " + url);
  }
  return ext;
}
