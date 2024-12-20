import { APIV1Read, DocsV1Read } from "@fern-api/fdr-sdk/client/types";
import {
  WithJsonLdBreadcrumbs,
  WithMetadataConfig,
} from "@fern-api/fdr-sdk/docs";
import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import {
  assertNonNullish,
  visitDiscriminatedUnion,
} from "@fern-api/ui-core-utils";
import { getFrontmatter, markdownToString } from "@fern-docs/mdx";
import type { LinkTag, MetaTag, NextSeoProps } from "@fern-docs/next-seo";
import { getToHref } from "../hooks/useHref";
import { getFontExtension } from "../themes/stylesheet/getFontVariables";
import { getBreadcrumbList } from "./getBreadcrumbList";

const EMPTY_METADATA_CONFIG: WithMetadataConfig & WithJsonLdBreadcrumbs = {
  "og:image": undefined,
  "og:image:width": undefined,
  "og:image:height": undefined,
  "og:title": undefined,
  "jsonld:breadcrumb": undefined,
  "og:description": undefined,
  "og:locale": undefined,
  "og:url": undefined,
  "og:site_name": undefined,
  "twitter:handle": undefined,
  "twitter:site": undefined,
  "twitter:card": undefined,
  "twitter:title": undefined,
  "twitter:description": undefined,
  "twitter:url": undefined,
  "twitter:image": undefined,
  "og:logo": undefined,
  noindex: false,
  nofollow: false,
  keywords: undefined,
};

function getFile(
  fileOrUrl: DocsV1Read.FileIdOrUrl,
  files: Record<string, DocsV1Read.File_>
): DocsV1Read.File_ {
  return visitDiscriminatedUnion(fileOrUrl)._visit({
    fileId: ({ value: fileId }) => {
      const file = files[fileId];
      assertNonNullish(file, `File with id ${fileId} not found`);
      return file;
    },
    url: ({ value: url }) => ({ type: "url", url }),
  });
}

export function getSeoProps(
  domain: string,
  { metadata, title, favicon, typographyV2: typography }: DocsV1Read.DocsConfig,
  pages: Record<string, DocsV1Read.PageContent>,
  files: Record<string, DocsV1Read.File_>,
  apis: Record<string, APIV1Read.ApiDefinition>,
  {
    node,
    parents,
    currentVersion,
  }: Pick<
    FernNavigation.utils.Node.Found,
    "node" | "parents" | "currentVersion" | "root"
  >,
  isSeoDisabled: boolean,
  isTrailingSlashEnabled: boolean
): NextSeoProps {
  const additionalMetaTags: MetaTag[] = [];
  const additionalLinkTags: LinkTag[] = [];
  const openGraph: NextSeoProps["openGraph"] = {};
  const twitter: NextSeoProps["twitter"] = {};
  const seo: NextSeoProps = {
    openGraph,
    twitter,
    additionalMetaTags,
    additionalLinkTags,
    breadcrumbList: undefined,
  };

  /**
   * The canonical url is self-referential unless there are multiple versions of the page.
   * Canonical slugs are computed upstream, where duplicated markdown pages, and multi-version docs are both handled.
   */
  // TODO: set canonical domain in docs.yml
  const toHref = getToHref(isTrailingSlashEnabled);
  seo.canonical = toHref(node.canonicalSlug ?? node.slug, domain);

  const pageId = FernNavigation.getPageId(node);

  let ogMetadata: WithMetadataConfig & WithJsonLdBreadcrumbs = {
    ...EMPTY_METADATA_CONFIG,
    ...metadata,
  };

  if (ogMetadata.keywords != null) {
    additionalMetaTags.push({
      name: "keywords",
      content: Array.isArray(ogMetadata.keywords)
        ? ogMetadata.keywords.join(", ")
        : ogMetadata.keywords,
    });
  }

  const page = pageId != null ? pages[pageId] : undefined;
  if (page != null) {
    const { data: frontmatter, content } = getFrontmatter(page.markdown);
    ogMetadata = { ...ogMetadata, ...frontmatter };

    // add breadcrumb list if it exists, otherwise compute it
    seo.breadcrumbList ??=
      ogMetadata["jsonld:breadcrumb"] ??
      getBreadcrumbList(domain, parents, node, frontmatter.title);

    // add canonical url if frontmatter has it
    if (frontmatter["canonical-url"] != null) {
      seo.canonical = frontmatter["canonical-url"];
    }

    // retrofit og:image, preferring og:image
    // TODO: (rohin) Come back here and support more image transformations (twitter, logo, etc)
    for (const frontmatterImageVar of [
      frontmatter.image,
      frontmatter["og:image"],
    ]) {
      if (frontmatterImageVar != null) {
        // TODO: (rohin) remove string check when fully migrated, but keeping for back compat
        if (typeof frontmatterImageVar === "string") {
          ogMetadata["og:image"] ??= {
            type: "url",
            value: APIV1Read.Url(frontmatterImageVar),
          };
        } else {
          visitDiscriminatedUnion(frontmatterImageVar, "type")._visit({
            fileId: (fileId) => {
              const realId = fileId.value.split(":")[1];
              if (realId != null) {
                fileId.value = APIV1Read.FileId(realId);
                ogMetadata["og:image"] = fileId;
              }
            },
            url: (url) => {
              ogMetadata["og:image"] = url;
            },
            _other: undefined,
          });
        }
      }
    }

    seo.title = markdownToString(
      frontmatter.headline ?? extractHeadline(content) ?? frontmatter.title
    );
    seo.description = markdownToString(
      frontmatter.description ?? frontmatter.subtitle ?? frontmatter.excerpt
    );
  }

  if (FernNavigation.isApiLeaf(node) && apis[node.apiDefinitionId] != null) {
    const definition = apis[node.apiDefinitionId];
    if (definition != null) {
      const api = FernNavigation.ApiDefinitionHolder.create(definition);

      visitDiscriminatedUnion(node)._visit({
        endpoint: ({ endpointId }) => {
          const endpoint = api.endpoints.get(endpointId);
          if (endpoint?.description != null) {
            seo.description ??= endpoint.description;
          }
        },
        webSocket: ({ webSocketId }) => {
          const webSocket = api.webSockets.get(webSocketId);
          if (webSocket?.description != null) {
            seo.description ??= webSocket.description;
          }
        },
        webhook: ({ webhookId }) => {
          const webhook = api.webhooks.get(webhookId);
          if (webhook?.description != null) {
            seo.description ??= webhook.description;
          }
        },
      });
    }
  }

  openGraph.title ??= ogMetadata["og:title"];
  openGraph.description ??= ogMetadata["og:description"];
  openGraph.locale ??= ogMetadata["og:locale"];
  openGraph.url ??= ogMetadata["og:url"];
  openGraph.siteName ??= ogMetadata["og:site_name"];
  twitter.handle ??= ogMetadata["twitter:handle"];
  twitter.site ??= ogMetadata["twitter:site"];
  twitter.cardType ??= ogMetadata["twitter:card"];

  if (ogMetadata["twitter:title"] != null) {
    additionalMetaTags.push({
      name: "twitter:title",
      content: ogMetadata["twitter:title"],
    });
  }

  if (ogMetadata["twitter:description"] != null) {
    additionalMetaTags.push({
      name: "twitter:description",
      content: ogMetadata["twitter:description"],
    });
  }

  if (ogMetadata["twitter:url"] != null) {
    additionalMetaTags.push({
      name: "twitter:url",
      content: ogMetadata["twitter:url"],
    });
  }

  if (ogMetadata["twitter:image"] != null) {
    const file = getFile(ogMetadata["twitter:image"], files);
    additionalMetaTags.push({
      name: "twitter:image",
      content: file.url,
    });

    if (file.type === "image") {
      additionalMetaTags.push({
        name: "twitter:image:width",
        content: String(file.width),
      });
      additionalMetaTags.push({
        name: "twitter:image:height",
        content: String(file.height),
      });
    }
  }

  if (ogMetadata["og:image"] != null) {
    const file = getFile(ogMetadata["og:image"], files);
    openGraph.images ??= [
      {
        url: file.url,
        width:
          ogMetadata["og:image:width"] ??
          (file.type === "image" ? file.width : undefined),
        height:
          ogMetadata["og:image:height"] ??
          (file.type === "image" ? file.height : undefined),
      },
    ];
  }

  // defaults
  seo.title ??= node.title;
  openGraph.siteName ??= title;

  /**
   * Disambiguate the title via the version title, if it exists and is not the default version.
   *
   * default:  Get Plants - Plant Store
   * v1:       Get Plants (v1) - Plant Store
   * v2:       Get Plants (v2) - Plant Store
   */
  if (title != null && currentVersion != null && !currentVersion.default) {
    seo.titleTemplate ??= `%s (${currentVersion.title}) — ${title}`;
  }

  /**
   * Fallback title template: "Page Title — Site Title"
   */
  if (title != null) {
    seo.titleTemplate ??= `%s — ${title}`;
  }

  if (favicon != null && files[favicon] != null) {
    const image = files[favicon];
    additionalLinkTags.push({
      rel: "icon",
      href: image.url,
      crossOrigin: "anonymous",
    });
  }

  // typography
  typography?.bodyFont?.variants.forEach((variant) => {
    const tag = getPreloadedFont(variant, files);
    if (tag != null) {
      additionalLinkTags.push(tag);
    }
  });
  typography?.codeFont?.variants.forEach((variant) => {
    const tag = getPreloadedFont(variant, files);
    if (tag != null) {
      additionalLinkTags.push(tag);
    }
  });
  typography?.headingsFont?.variants.forEach((variant) => {
    const tag = getPreloadedFont(variant, files);
    if (tag != null) {
      additionalLinkTags.push(tag);
    }
  });

  seo.noindex = ogMetadata.noindex;
  seo.nofollow = ogMetadata.nofollow;

  // do not index the page if it is hidden, or has noindex set, or if SEO is disabled
  if (
    (FernNavigation.hasMarkdown(node) && node.noindex) ||
    node.hidden ||
    isSeoDisabled
  ) {
    seo.noindex = true;
  }

  if (isSeoDisabled) {
    seo.nofollow = true;
  }

  return seo;
}

function getPreloadedFont(
  variant: DocsV1Read.CustomFontConfigVariant,
  files: Record<DocsV1Read.FileId, DocsV1Read.File_>
): LinkTag | null {
  const file = files[variant.fontFile]?.url;
  if (file == null) {
    return null;
  }
  let fontExtension: string;
  try {
    fontExtension = getFontExtension(new URL(file).pathname);
  } catch (_) {
    fontExtension = getFontExtension(file);
  }
  return {
    rel: "preload",
    href: file,
    as: "font",
    type: `font/${fontExtension}`,
    crossOrigin: "anonymous",
  };
}

// TODO: make this more robust and well-tested i.e. title over multiple lines
export function extractHeadline(markdownContent: string): string | undefined {
  if (
    markdownContent.trim().startsWith("#") &&
    !markdownContent.trim().startsWith("##")
  ) {
    return markdownContent.trim().split("\n")[0];
  }
  return;
}
