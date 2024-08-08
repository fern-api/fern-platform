import { DocsV2Read, FernNavigation } from "@fern-api/fdr-sdk";
import { visitDiscriminatedUnion } from "@fern-ui/core-utils";
import { SidebarTab } from "@fern-ui/fdr-utils";
import {
    DEFAULT_FEATURE_FLAGS,
    DocsPage,
    FeatureFlags,
    convertNavigatableToResolvedPath,
    getGitHubInfo,
    getGitHubRepo,
    getSeoProps,
    renderThemeStylesheet,
} from "@fern-ui/ui";
import type { GetServerSidePropsResult } from "next";
import { ComponentProps } from "react";
import urljoin from "url-join";

export async function getDocsPageProps(
    docs: DocsV2Read.LoadDocsForUrlResponse,
    slugArray: string[],
): Promise<GetServerSidePropsResult<ComponentProps<typeof DocsPage>>> {
    // HACKHACK: temporarily disable endpoint pairs for cohere in local preview
    const root = FernNavigation.utils.convertLoadDocsForUrlResponse(docs, docs.baseUrl.domain.includes("cohere"));
    const slug = FernNavigation.utils.slugjoin(...slugArray);
    const node = FernNavigation.utils.findNode(root, slug);

    if (node.type === "notFound") {
        // eslint-disable-next-line no-console
        console.error(`Failed to resolve navigation for ${slug}`);
        if (node.redirect != null) {
            return {
                redirect: {
                    destination: encodeURI(urljoin("/", node.redirect)),
                    permanent: false,
                },
            };
        }
        return { notFound: true };
    }

    if (node.type === "redirect") {
        return {
            redirect: {
                destination: encodeURI(urljoin("/", node.redirect)),
                permanent: false,
            },
        };
    }

    // TODO: get feature flags from the API
    const featureFlags: FeatureFlags = DEFAULT_FEATURE_FLAGS;

    const resolvedPath = await convertNavigatableToResolvedPath({
        found: node,
        apis: docs.definition.apis,
        pages: docs.definition.pages,
        domain: docs.baseUrl.domain,
        featureFlags,
        mdxOptions: {
            files: docs.definition.jsFiles,
        },
    });

    if (resolvedPath == null) {
        // eslint-disable-next-line no-console
        console.error(`Failed to resolve path for ${slug}`);
        return { notFound: true };
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

    const props: ComponentProps<typeof DocsPage> = {
        baseUrl: docs.baseUrl,
        layout: docs.definition.config.layout,
        title: docs.definition.config.title,
        favicon: docs.definition.config.favicon,
        colors,
        js: docs.definition.config.js,
        navbarLinks: docs.definition.config.navbarLinks ?? [],
        logoHeight: docs.definition.config.logoHeight,
        logoHref: docs.definition.config.logoHref,
        files: docs.definition.filesV2,
        resolvedPath,
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
            versions: node.versions
                .filter((version) => !version.hidden)
                .map((version, index) => ({
                    title: version.title,
                    id: version.versionId,
                    slug: version.slug,
                    index,
                    availability: version.availability,
                })),
            sidebar: node.sidebar,
        },
        featureFlags,
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
        fallback: {},
        analytics: undefined,
        theme: docs.baseUrl.domain.includes("cohere") ? "cohere" : "default",
        user: undefined,
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

    // if the user specifies a github navbar link, grab the repo info from it and save it as an SWR fallback
    const githubNavbarLink = docs.definition.config.navbarLinks?.find((link) => link.type === "github");
    if (githubNavbarLink) {
        const repo = getGitHubRepo(githubNavbarLink.url);
        if (repo) {
            const data = await getGitHubInfo(repo);
            if (data) {
                props.fallback[repo] = data;
            }
        }
    }

    return { props };
}
