import { DocsV2Read, FernNavigation } from "@fern-api/fdr-sdk";
import { visitDiscriminatedUnion } from "@fern-ui/core-utils";
import { SidebarTab } from "@fern-ui/fdr-utils";
import {
    DEFAULT_FEATURE_FLAGS,
    DocsPage,
    DocsPageResult,
    FeatureFlags,
    convertNavigatableToResolvedPath,
} from "@fern-ui/ui";
import urljoin from "url-join";

export async function getDocsPageProps(
    docs: DocsV2Read.LoadDocsForUrlResponse,
    slug: string[],
): Promise<DocsPageResult<DocsPage.Props>> {
    const root = FernNavigation.utils.convertLoadDocsForUrlResponse(docs);
    const node = FernNavigation.utils.findNode(root, slug);

    if (node.type === "notFound") {
        // eslint-disable-next-line no-console
        console.error(`Failed to resolve navigation for ${slug.join("")}`);
        if (node.redirect != null) {
            return {
                type: "redirect",
                redirect: {
                    destination: encodeURI(urljoin("/", node.redirect)),
                    permanent: false,
                },
            };
        }
        return { type: "notFound", notFound: true };
    }

    if (node.type === "redirect") {
        return {
            type: "redirect",
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
    });

    if (resolvedPath == null) {
        // eslint-disable-next-line no-console
        console.error(`Failed to resolve path for ${slug.join("/")}`);
        return { type: "notFound", notFound: true };
    }

    const props: DocsPage.Props = {
        baseUrl: docs.baseUrl,
        layout: docs.definition.config.layout,
        title: docs.definition.config.title,
        favicon: docs.definition.config.favicon,
        colors: {
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
        },
        typography: docs.definition.config.typographyV2,
        css: docs.definition.config.css,
        js: docs.definition.config.js,
        navbarLinks: docs.definition.config.navbarLinks ?? [],
        logoHeight: docs.definition.config.logoHeight,
        logoHref: docs.definition.config.logoHref,
        search: docs.definition.search,
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
            currentVersionIndex: node.currentVersion == null ? undefined : node.versions.indexOf(node.currentVersion),
            versions: node.versions.map((version, index) => ({
                id: version.versionId,
                slug: version.slug,
                index,
                availability: version.availability,
            })),
            sidebar: node.sidebar,
        },
        featureFlags,
        apis: Object.keys(docs.definition.apis),
    };

    return {
        type: "props",
        props: JSON.parse(JSON.stringify(props)), // remove all undefineds
    };
}
