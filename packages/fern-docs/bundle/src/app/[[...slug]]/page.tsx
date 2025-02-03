"use server";

import { renderThemeStylesheet } from "@/client/themes/stylesheet/renderThemeStylesheet";
import GlobalStyle from "@/components/global-style";
import Preload, { PreloadHref } from "@/components/preload";
import { createCachedDocsLoader } from "@/server/cached-docs-loader";
import { createFindNode } from "@/server/find-node";
import { withServerProps } from "@/server/withServerProps";
import { DocsV2Read, FernNavigation } from "@fern-api/fdr-sdk";
import { FileIdOrUrl } from "@fern-api/fdr-sdk/docs";
import { withDefaultProtocol } from "@fern-api/ui-core-utils";
import { getEdgeFlags, getSeoDisabled } from "@fern-docs/edge-config";
import { getFrontmatter, markdownToString } from "@fern-docs/mdx";
import { getBreadcrumbList } from "@fern-docs/seo";
import { Breadcrumb } from "@fern-docs/seo/src/jsonld";
import {
  addLeadingSlash,
  conformTrailingSlash,
  EdgeFlags,
} from "@fern-docs/utils";
import { compact } from "es-toolkit/array";
import { Metadata } from "next";

export default async function Page({
  params,
}: {
  params: { slug?: string[] };
}) {
  const slug = FernNavigation.slugjoin(params.slug);
  const { domain, host, fern_token } = await withServerProps();
  const docsLoader = createCachedDocsLoader(domain, host);
  const findNode = createFindNode(docsLoader);
  const { node, parents, tabs } = await findNode(slug, fern_token);
  const config = await docsLoader.getConfig();
  const colors = {
    light:
      config?.colorsV3?.type === "light"
        ? config?.colorsV3
        : config?.colorsV3?.type === "darkAndLight"
          ? config?.colorsV3.light
          : undefined,
    dark:
      config?.colorsV3?.type === "dark"
        ? config?.colorsV3
        : config?.colorsV3?.type === "darkAndLight"
          ? config?.colorsV3.dark
          : undefined,
  };

  const stylesheet = renderThemeStylesheet(
    colors,
    config?.typographyV2,
    config?.layout,
    config?.css,
    await docsLoader.getFiles(),
    tabs.length > 0
  );

  const edgeFlags = await getEdgeFlags(domain);

  return (
    <>
      <GlobalStyle>{stylesheet}</GlobalStyle>
      <Preload
        hrefs={generatePreloadHrefs(
          config?.typographyV2,
          await docsLoader.getFiles(),
          edgeFlags
        )}
      />
      <Breadcrumb
        // TODO: add jsonld override from frontmatter
        breadcrumbList={getBreadcrumbList(domain, parents, node)}
      />
    </>
  );
}

export async function generateMetadata({
  params,
}: {
  params: { slug?: string[] };
}): Promise<Metadata> {
  const slug = FernNavigation.slugjoin(params.slug);
  const { domain, host, fern_token } = await withServerProps();
  const docsLoader = createCachedDocsLoader(domain, host);
  const findNode = createFindNode(docsLoader);
  const files = await docsLoader.getFiles();
  const { node } = await findNode(slug, fern_token);
  const config = await docsLoader.getConfig();
  const baseUrl = await docsLoader.getBaseUrl();
  const pageId = FernNavigation.getPageId(node);
  const page = pageId ? await docsLoader.getPage(pageId) : undefined;
  const frontmatter = page ? getFrontmatter(page.markdown)?.data : undefined;

  const isSeoDisabled = await getSeoDisabled(domain);
  const noindex =
    (FernNavigation.hasMarkdown(node) && node.noindex) ||
    isSeoDisabled ||
    config?.metadata?.noindex ||
    frontmatter?.noindex ||
    false;
  const nofollow =
    isSeoDisabled ||
    config?.metadata?.nofollow ||
    frontmatter?.nofollow ||
    false;

  return {
    metadataBase: new URL(baseUrl.basePath || "/", withDefaultProtocol(domain)),
    applicationName: config?.title,
    title:
      markdownToString(
        frontmatter?.headline || frontmatter?.title || node.title
      ) ?? node.title,
    description: markdownToString(
      frontmatter?.description || frontmatter?.subtitle || frontmatter?.excerpt
    ),
    keywords: frontmatter?.keywords,
    robots: {
      index: !noindex,
      follow: !nofollow,
    },
    alternates: {
      canonical:
        frontmatter?.["canonical-url"] ??
        conformTrailingSlash(addLeadingSlash(node.canonicalSlug ?? node.slug)),
    },
    openGraph: {
      title: frontmatter?.["og:title"] ?? config?.metadata?.["og:title"],
      description:
        frontmatter?.["og:description"] ?? config?.metadata?.["og:description"],
      locale: frontmatter?.["og:locale"] ?? config?.metadata?.["og:locale"],
      url: frontmatter?.["og:url"] ?? config?.metadata?.["og:url"],
      siteName:
        frontmatter?.["og:site_name"] ?? config?.metadata?.["og:site_name"],
      images:
        toImageDescriptor(
          files,
          frontmatter?.["og:image"],
          frontmatter?.["og:image:width"],
          frontmatter?.["og:image:height"]
        ) ?? toImageDescriptor(files, frontmatter?.image),
    },
    twitter: {
      site: frontmatter?.["twitter:site"] ?? config?.metadata?.["twitter:site"],
      creator:
        frontmatter?.["twitter:handle"] ?? config?.metadata?.["twitter:handle"],
      title:
        frontmatter?.["twitter:title"] ?? config?.metadata?.["twitter:title"],
      description:
        frontmatter?.["twitter:description"] ??
        config?.metadata?.["twitter:description"],
      images: toImageDescriptor(files, frontmatter?.["twitter:image"]),
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
  files: Record<string, { url: string }>,
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
          href: file.url,
          options: {
            as: "font",
            crossOrigin: "anonymous",
            type: `font/${getFontExtension(file.url)}`,
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

function toImageDescriptor(
  files: Record<
    string,
    { url: string; width?: number; height?: number; alt?: string }
  >,
  image: FileIdOrUrl | undefined,
  width?: number,
  height?: number
): { url: string; width?: number; height?: number; alt?: string } | undefined {
  if (image == null) {
    return undefined;
  }

  if (image.type === "url") {
    return { url: image.value };
  }

  const file = files[image.value];
  if (file == null) {
    return undefined;
  }
  return {
    url: file.url,
    width: width ?? file.width,
    height: height ?? file.height,
    alt: file.alt,
  };
}
