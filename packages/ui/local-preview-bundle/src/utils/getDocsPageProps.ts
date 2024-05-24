import { DocsV2Read } from "@fern-api/fdr-sdk";
import { getNavigationRoot } from "@fern-ui/fdr-utils";
import {
    DEFAULT_FEATURE_FLAGS,
    DocsPage,
    DocsPageResult,
    FeatureFlags,
    convertNavigatableToResolvedPath,
    serializeSidebarNodeDescriptionMdx,
} from "@fern-ui/ui";

export async function getDocsPageProps(
    docs: DocsV2Read.LoadDocsForUrlResponse,
    slug: string[],
): Promise<DocsPageResult<DocsPage.Props>> {
    const docsDefinition = docs.definition;
    const basePath = docs.baseUrl.basePath;
    const docsConfig = docsDefinition.config;

    const navigation = getNavigationRoot(
        slug,
        docs.baseUrl.domain,
        docs.baseUrl.basePath,
        docsConfig.navigation,
        docs.definition.apis,
        docs.definition.pages,
    );

    if (navigation == null) {
        // eslint-disable-next-line no-console
        console.error(`Failed to resolve navigation for ${slug.join("/")}`);
        return {
            type: "redirect",
            redirect: {
                destination: basePath ?? "/",
                permanent: false,
            },
        };
    }

    if (navigation.type === "redirect") {
        return {
            type: "redirect",
            redirect: {
                destination: navigation.redirect,
                permanent: false,
            },
        };
    }

    const sidebarNodes = await Promise.all(
        navigation.found.sidebarNodes.map((node) => serializeSidebarNodeDescriptionMdx(node)),
    );

    // TODO: get feature flags from the API
    const featureFlags: FeatureFlags = DEFAULT_FEATURE_FLAGS;

    const resolvedPath = await convertNavigatableToResolvedPath({
        currentNode: navigation.found.currentNode,
        rawSidebarNodes: navigation.found.sidebarNodes,
        sidebarNodes,
        apis: docsDefinition.apis,
        pages: docsDefinition.pages,
        mdxOptions: {
            showError: true,
        },
        domain: docs.baseUrl.domain,
        featureFlags,
    });

    if (resolvedPath == null) {
        // eslint-disable-next-line no-console
        console.error(`Failed to resolve path for ${slug.join("/")}`);
        return {
            type: "redirect",
            redirect: {
                destination: basePath ?? "/",
                permanent: false,
            },
        };
    }

    if (resolvedPath.type === "redirect") {
        return {
            type: "redirect",
            redirect: {
                destination: "/" + encodeURI(resolvedPath.fullSlug),
                permanent: false,
            },
        };
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
            currentTabIndex: navigation.found.currentTabIndex,
            tabs: navigation.found.tabs,
            currentVersionIndex: navigation.found.currentVersionIndex,
            versions: navigation.found.versions,
            sidebarNodes,
        },
        featureFlags,
        apis: Object.keys(docs.definition.apis),
    };

    return {
        type: "props",
        props: JSON.parse(JSON.stringify(props)), // remove all undefineds
    };
}
