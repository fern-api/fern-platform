import { isTrailingSlashEnabled } from "@/server/trailingSlash";
import { FdrAPI, FernNavigation, visitDiscriminatedUnion } from "@fern-api/fdr-sdk";
import { SidebarTab } from "@fern-ui/fdr-utils";
import {
    DEFAULT_FEATURE_FLAGS,
    DocsPage,
    getSeoProps,
    renderThemeStylesheet,
    resolveDocsContent,
    serializeMdx,
    setMdxBundler,
} from "@fern-ui/ui";
import { getMdxBundler } from "@fern-ui/ui/bundlers";
import { ComponentProps } from "react";

export async function withInitialProps(
    slug: FernNavigation.Slug,
    docs: FdrAPI.docs.v2.read.LoadDocsForUrlResponse,
): Promise<ComponentProps<typeof DocsPage> | undefined> {
    const root = FernNavigation.utils.convertLoadDocsForUrlResponse(docs);

    // if the root has a slug and the current slug is empty, redirect to the root slug, rather than 404
    if (root.slug.length > 0 && slug.length === 0) {
        return undefined;
    }

    const node = FernNavigation.utils.findNode(root, slug);

    if (node.type === "notFound") {
        return undefined;
    }

    if (node.type === "redirect") {
        return undefined;
    }

    setMdxBundler(await getMdxBundler("next-mdx-remote"));

    const content = await resolveDocsContent({
        found: node,
        apis: docs.definition.apis,
        pages: docs.definition.pages,
        domain: docs.baseUrl.domain,
        featureFlags: DEFAULT_FEATURE_FLAGS,
        mdxOptions: { files: docs.definition.jsFiles },
    });

    if (content == null) {
        return undefined;
    }

    const colors = {
        light:
            docs.definition.config.colorsV3?.type === "light"
                ? docs.definition.config.colorsV3
                : docs.definition.config.colorsV3?.type === "darkAndLight"
                  ? docs.definition.config.colorsV3.light
                  : undefined,
        dark:
            docs.definition.config.colorsV3?.type === "dark"
                ? docs.definition.config.colorsV3
                : docs.definition.config.colorsV3?.type === "darkAndLight"
                  ? docs.definition.config.colorsV3.dark
                  : undefined,
    };

    const versions = node.versions
        .filter((version) => !version.hidden)
        .map((version, index) => {
            // if the same page exists in multiple versions, return the full slug of that page, otherwise default to version's landing page (pointsTo)
            const expectedSlug = FernNavigation.utils.slugjoin(version.slug, node.unversionedSlug);
            const pointsTo = node.collector.slugMap.has(expectedSlug) ? expectedSlug : version.pointsTo;

            return {
                title: version.title,
                id: version.versionId,
                slug: version.slug,
                pointsTo,
                index,
                availability: version.availability,
            };
        });

    const props: ComponentProps<typeof DocsPage> = {
        baseUrl: docs.baseUrl,
        layout: docs.definition.config.layout,
        title: docs.definition.config.title,
        favicon: docs.definition.config.favicon,
        colors,
        js: docs.definition.config.js,
        navbarLinks: docs.definition.config.navbarLinks ?? [],
        logoHeight: docs.definition.config.logoHeight,
        logoHref:
            docs.definition.config.logoHref ??
            (node.landingPage?.slug != null && !node.landingPage.hidden ? `/${node.landingPage.slug}` : undefined),
        files: docs.definition.filesV2,
        content,
        announcement:
            docs.definition.config.announcement != null
                ? {
                      mdx: await serializeMdx(docs.definition.config.announcement.text),
                      text: docs.definition.config.announcement.text,
                  }
                : undefined,
        navigation: {
            currentTabIndex: node.currentTab == null ? undefined : node.tabs.indexOf(node.currentTab),
            tabs: node.tabs.map((tab, index) =>
                visitDiscriminatedUnion(tab)._visit<SidebarTab>({
                    tab: (tab) => ({
                        type: "tabGroup",
                        title: tab.title,
                        icon: tab.icon,
                        index,
                        slug: tab.slug,
                        pointsTo: tab.pointsTo,
                    }),
                    link: (link) => ({
                        type: "tabLink",
                        title: link.title,
                        icon: link.icon,
                        index,
                        url: link.url,
                    }),
                    changelog: (changelog) => ({
                        type: "tabChangelog",
                        title: changelog.title,
                        icon: changelog.icon,
                        index,
                        slug: changelog.slug,
                    }),
                }),
            ),
            currentVersionId: node.currentVersion?.versionId,
            versions,
            sidebar: node.sidebar,
            trailingSlash: isTrailingSlashEnabled(),
        },
        featureFlags: DEFAULT_FEATURE_FLAGS,
        apis: Object.keys(docs.definition.apis),
        seo: getSeoProps(
            docs.baseUrl.domain,
            docs.definition.config,
            docs.definition.pages,
            docs.definition.filesV2,
            docs.definition.apis,
            node,
            true,
        ),
        user: undefined,
        fallback: {},
        analytics: undefined,
        theme: "default",
        analyticsConfig: docs.definition.config.analyticsConfig,
        defaultLang: docs.definition.config.defaultLanguage ?? "curl",
        stylesheet: renderThemeStylesheet(
            colors,
            docs.definition.config.typographyV2,
            docs.definition.config.layout,
            docs.definition.config.css,
            docs.definition.filesV2,
            node.tabs.length > 0,
        ),
    };

    return JSON.parse(JSON.stringify(props));
}
