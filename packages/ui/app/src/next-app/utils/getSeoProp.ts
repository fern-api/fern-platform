import { DocsV1Read, FernNavigation } from "@fern-api/fdr-sdk";
import { visitDiscriminatedUnion } from "@fern-ui/core-utils";
import grayMatter from "gray-matter";
import type { DefaultSeoProps, LinkTag, MetaTag, NextSeoProps } from "next-seo/lib/types";
import { FernDocsFrontmatter } from "../../mdx/mdx";
import { getFontExtension } from "./getFontVariables";

function getFile(fileOrUrl: DocsV1Read.FileIdOrUrl, files: Record<string, DocsV1Read.File_>): DocsV1Read.File_ {
    return visitDiscriminatedUnion(fileOrUrl)._visit({
        fileId: ({ value: fileId }) => files[fileId],
        url: ({ value: url }) => ({ type: "url", url }),
    });
}

function getFrontmatter(content: string): FernDocsFrontmatter {
    try {
        const gm = grayMatter(content);
        return gm.data;
    } catch (e) {
        return {};
    }
}

export function getDefaultSeoProps(
    domain: string,
    { metadata, title, favicon, typographyV2: typography }: DocsV1Read.DocsConfig,
    pages: Record<string, DocsV1Read.PageContent>,
    files: Record<string, DocsV1Read.File_>,
    node: FernNavigation.NavigationNodePage,
): DefaultSeoProps {
    const additionalMetaTags: MetaTag[] = [];
    const additionalLinkTags: LinkTag[] = [];
    const openGraph: DefaultSeoProps["openGraph"] = {};
    const twitter: DefaultSeoProps["twitter"] = {};
    const seo: DefaultSeoProps = {
        openGraph,
        twitter,
        additionalMetaTags,
        additionalLinkTags,
    };

    const pageId = FernNavigation.utils.getPageId(node);

    if (pageId != null && pages[pageId]) {
        const frontmatter = getFrontmatter(pages[pageId].markdown);
        seo.title ??= frontmatter.title;
        seo.description ??= frontmatter.description ?? frontmatter.subtitle ?? frontmatter.excerpt;
        openGraph.title ??= frontmatter["og:title"] ?? frontmatter.title;
        openGraph.description ??= frontmatter["og:description"];
        openGraph.locale ??= frontmatter["og:locale"];
        openGraph.url ??= frontmatter["og:url"];
        openGraph.siteName ??= frontmatter["og:site_name"];
        twitter.handle ??= frontmatter["twitter:handle"];
        twitter.site ??= frontmatter["twitter:site"];
        twitter.cardType ??= frontmatter["twitter:card"];

        if (frontmatter["og:image"] != null) {
            const file = getFile(frontmatter["og:image"], files);
            openGraph.images ??= [
                {
                    url: file.url,
                    width: frontmatter["og:image:width"] ?? (file.type === "image" ? file.width : undefined),
                    height: frontmatter["og:image:height"] ?? (file.type === "image" ? file.height : undefined),
                },
            ];
        }
    }

    if (metadata != null) {
        if (metadata["og:image"] != null) {
            const file = getFile(metadata["og:image"], files);
            openGraph.images ??= [
                {
                    url: file.url,
                    width: metadata["og:image:width"] ?? (file.type === "image" ? file.width : undefined),
                    height: metadata["og:image:height"] ?? (file.type === "image" ? file.height : undefined),
                },
            ];
        }

        openGraph.title ??= metadata["og:title"];
        openGraph.description ??= metadata["og:description"];
        openGraph.locale ??= metadata["og:locale"];
        openGraph.url ??= metadata["og:url"];
        openGraph.siteName ??= metadata["og:site_name"];
        twitter.handle ??= metadata["twitter:handle"];
        twitter.site ??= metadata["twitter:site"];
        twitter.cardType ??= metadata["twitter:card"];
    }

    // defaults
    seo.title ??= node.title ?? title ?? "Fern Documentation";
    openGraph.siteName ??= title;

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

    // noindex, nofollow
    if (
        domain.endsWith(".docs.dev.buildwithfern.com") ||
        domain.endsWith(".docs.staging.buildwithfern.com") ||
        domain.endsWith(".docs.buildwithfern.com") ||
        process.env.NODE_ENV !== "production"
    ) {
        seo.dangerouslySetAllPagesToNoIndex = true;
        seo.dangerouslySetAllPagesToNoFollow = true;
        seo.norobots = true;
    }

    return seo;
}

export function getNextSeoProps(node: FernNavigation.NavigationNodeWithMetadata | undefined): NextSeoProps {
    const seo: NextSeoProps = {};
    seo.title ??= node?.title;
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
