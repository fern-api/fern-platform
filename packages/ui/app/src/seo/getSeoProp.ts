import { APIV1Read, DocsV1Read } from "@fern-api/fdr-sdk/client/types";
import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { assertNonNullish, visitDiscriminatedUnion } from "@fern-ui/core-utils";
import type { LinkTag, MetaTag, NextSeoProps } from "@fern-ui/next-seo";
import { trim } from "lodash-es";
import { fromMarkdown } from "mdast-util-from-markdown";
import { toHast } from "mdast-util-to-hast";
import { visit } from "unist-util-visit";
import { getToHref } from "../hooks/useHref";
import { stringHasMarkdown } from "../mdx/common/util";
import { getFrontmatter } from "../mdx/frontmatter";
import { getFontExtension } from "../themes/stylesheet/getFontVariables";
import { getBreadcrumbList } from "./getBreadcrumbList";

const EMPTY_METADATA_CONFIG: DocsV1Read.MetadataConfig = {
    "og:image": undefined,
    "og:image:width": undefined,
    "og:image:height": undefined,
    "og:title": undefined,
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
};

function getFile(fileOrUrl: DocsV1Read.FileIdOrUrl, files: Record<string, DocsV1Read.File_>): DocsV1Read.File_ {
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
    { node, parents }: Pick<FernNavigation.utils.Node.Found, "node" | "parents" | "currentVersion" | "root">,
    isSeoDisabled: boolean,
    isTrailingSlashEnabled: boolean,
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
        breadcrumbList: getBreadcrumbList(domain, pages, parents, node),
    };

    /**
     * The canonical url is self-referential unless there are multiple versions of the page.
     * Canonical slugs are computed upstream, where duplicated markdown pages, and multi-version docs are both handled.
     */
    // TODO: set canonical domain in docs.yml
    const toHref = getToHref(isTrailingSlashEnabled);
    seo.canonical = toHref(node.canonicalSlug ?? node.slug, domain);

    const pageId = FernNavigation.getPageId(node);

    let ogMetadata: DocsV1Read.MetadataConfig = metadata ?? EMPTY_METADATA_CONFIG;
    let seoTitleFromMarkdownH1;
    let frontmatterHeadline;

    if (pageId != null) {
        const page = pages[pageId];
        if (page != null) {
            const { data: frontmatter, content } = getFrontmatter(page.markdown);
            ogMetadata = { ...ogMetadata, ...frontmatter };

            // retrofit og:image, preferring og:image
            // TODO: (rohin) Come back here and support more image transformations (twitter, logo, etc)
            for (const frontmatterImageVar of [frontmatter.image, frontmatter["og:image"]]) {
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

            seoTitleFromMarkdownH1 = extractHeadline(content);
            frontmatterHeadline = frontmatter.headline;

            seo.title ??= frontmatterHeadline ?? seoTitleFromMarkdownH1 ?? frontmatter.title;
            seo.description ??= frontmatter.description ?? frontmatter.subtitle ?? frontmatter.excerpt;
        }
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

    if (seo.title != null && stringHasMarkdown(seo.title)) {
        seo.title = stripMarkdown(seo.title);
    }
    if (seo.description != null && stringHasMarkdown(seo.description)) {
        seo.description = stripMarkdown(seo.description);
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
                width: ogMetadata["og:image:width"] ?? (file.type === "image" ? file.width : undefined),
                height: ogMetadata["og:image:height"] ?? (file.type === "image" ? file.height : undefined),
            },
        ];
    }

    // defaults
    seo.title ??= node.title;
    openGraph.siteName ??= title;
    if (title != null) {
        seo.titleTemplate ??= frontmatterHeadline ?? seoTitleFromMarkdownH1 ?? `%s — ${title}`;
    }

    if (favicon != null && files[favicon] != null) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const image = files[favicon]!;
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
    if ((FernNavigation.hasMarkdown(node) && node.noindex) || node.hidden || isSeoDisabled) {
        seo.noindex = true;
    }

    if (isSeoDisabled) {
        seo.nofollow = true;
    }

    return seo;
}

function getPreloadedFont(
    variant: DocsV1Read.CustomFontConfigVariant,
    files: Record<DocsV1Read.FileId, DocsV1Read.File_>,
): LinkTag | null {
    const file = files[variant.fontFile]?.url;
    if (file == null) {
        return null;
    }
    let fontExtension: string;
    try {
        fontExtension = getFontExtension(new URL(file).pathname);
    } catch (err) {
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

function stripMarkdown(markdown: string): string {
    try {
        const tree = toHast(fromMarkdown(markdown));

        let toRet = "";
        visit(tree, "text", (node) => {
            toRet += node.value + " ";
        });

        return trim(toRet);
    } catch (e) {
        return markdown;
    }
}

export function extractHeadline(markdownContent: string): string | undefined {
    if (markdownContent.trim().startsWith("#") && !markdownContent.trim().startsWith("##")) {
        return stripMarkdown(markdownContent.trim().split("\n")[0] ?? "");
    }
    return;
}
