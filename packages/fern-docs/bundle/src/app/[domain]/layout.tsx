import { CustomerAnalytics } from "@/components/analytics/CustomerAnalytics";
import { JavascriptProvider } from "@/components/components/JavascriptProvider";
import Preload, { PreloadHref } from "@/components/preload";
import { SearchV2 } from "@/components/search";
import { renderThemeStylesheet } from "@/components/themes/stylesheet/renderThemeStylesheet";
import { ThemeScript } from "@/components/themes/ThemeScript";
import { createCachedDocsLoader } from "@/server/docs-loader";
import { RgbaColor } from "@/server/types";
import { DocsV2Read } from "@fern-api/fdr-sdk/client/types";
import { withDefaultProtocol } from "@fern-api/ui-core-utils";
import { getEdgeFlags, getSeoDisabled } from "@fern-docs/edge-config";
import { EdgeFlags } from "@fern-docs/utils";
import { compact, uniqBy } from "es-toolkit/array";
import { Metadata, Viewport } from "next/types";
import tinycolor from "tinycolor2";
import { GlobalStyles } from "../global-styles";
import { toImageDescriptor } from "../seo";

export default async function Layout(
  props: {
    children: React.ReactNode;
    params: Promise<{ domain: string }>;
  }
) {
  const params = await props.params;

  const {
    children
  } = props;

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
      <SearchV2 />
      <JavascriptProvider />
      <CustomerAnalytics />
    </>
  );
}

export async function generateViewport(
  props: {
    params: Promise<{ domain: string }>;
  }
): Promise<Viewport> {
  const params = await props.params;
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

export async function generateMetadata(
  props: {
    params: Promise<{ domain: string }>;
  }
): Promise<Metadata> {
  const params = await props.params;
  const domain = params.domain;
  const docsLoader = await createCachedDocsLoader(domain);
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
    href: "/api/fern-docs/search/v2/key",
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
