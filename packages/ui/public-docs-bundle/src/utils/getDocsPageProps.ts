import {
    buildUrl,
    convertNavigatableToResolvedPath,
    DocsPage,
    DocsPageResult,
    getNavigation,
    REGISTRY_SERVICE,
} from "@fern-ui/ui";

export const getDocsPageProps = async (
    xFernHost: string | undefined,
    slugArray: string[],
): Promise<DocsPageResult<DocsPage.Props>> => {
    if (xFernHost == null || Array.isArray(xFernHost)) {
        return { type: "notFound", notFound: true };
    }

    const pathname = decodeURI(slugArray != null ? slugArray.join("/") : "");
    const url = buildUrl({ host: xFernHost, pathname });
    const docs = await REGISTRY_SERVICE.docs.v2.read.getDocsForUrl({ url });

    if (!docs.ok) {
        // eslint-disable-next-line no-console
        console.error(`Failed to fetch docs for ${url}`, docs.error);
        return {
            type: "notFound",
            notFound: true,
            revalidate: 60,
        };
    }

    const docsDefinition = docs.body.definition;
    const basePath = docs.body.baseUrl.basePath;
    const docsConfig = docsDefinition.config;

    const navigation = await getNavigation(slugArray, basePath, docs.body.definition.apis, docsConfig.navigation);

    if (navigation == null) {
        // eslint-disable-next-line no-console
        console.error(`Failed to resolve navigation for ${url}`);
        return { type: "notFound", notFound: true };
    }

    const resolvedPath = await convertNavigatableToResolvedPath({
        slug: slugArray,
        sidebarNodes: navigation.sidebarNodes,
        apis: docsDefinition.apis,
        pages: docsDefinition.pages,
    });

    if (resolvedPath == null) {
        // eslint-disable-next-line no-console
        console.error(`Failed to resolve path for ${url}`);
        return {
            type: "notFound",
            notFound: true,
            revalidate: 60 * 60, // 1 hour
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

    const isApiPlaygroundEnabled = await fetch(`https://${xFernHost}/api/fern-docs/config/api-playground-enabled`, {
        headers: { "x-fern-host": xFernHost },
    })
        .then((r): Promise<boolean> => r.json())
        .catch((e) => {
            // eslint-disable-next-line no-console
            console.error(e);
            return false;
        });

    const props: DocsPage.Props = {
        baseUrl: docs.body.baseUrl,
        layout: docs.body.definition.config.layout,
        title: docs.body.definition.config.title,
        favicon: docs.body.definition.config.favicon,
        backgroundImage: docs.body.definition.config.backgroundImage,
        colors: {
            light:
                docs.body.definition.config.colorsV3?.type === "light"
                    ? docs.body.definition.config.colorsV3
                    : docs.body.definition.config.colorsV3?.type === "darkAndLight"
                      ? docs.body.definition.config.colorsV3.light
                      : undefined,
            dark:
                docs.body.definition.config.colorsV3?.type === "dark"
                    ? docs.body.definition.config.colorsV3
                    : docs.body.definition.config.colorsV3?.type === "darkAndLight"
                      ? docs.body.definition.config.colorsV3.dark
                      : undefined,
        },
        typography: docs.body.definition.config.typographyV2,
        css: docs.body.definition.config.css,
        js: docs.body.definition.config.js,
        navbarLinks: docs.body.definition.config.navbarLinks ?? [],
        logoHeight: docs.body.definition.config.logoHeight,
        logoHref: docs.body.definition.config.logoHref,
        search: docs.body.definition.search,
        algoliaSearchIndex: docs.body.definition.algoliaSearchIndex,
        files: docs.body.definition.filesV2,
        resolvedPath,
        navigation,
        isApiPlaygroundEnabled,
    };

    return {
        type: "props",
        props: JSON.parse(JSON.stringify(props)), // remove all undefineds
        revalidate: 60 * 60 * 24 * 6, // 6 days
    };
};
