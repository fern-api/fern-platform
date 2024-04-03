import type { DocsV2Read } from "@fern-api/fdr-sdk";
import { getNavigationRoot } from "@fern-ui/fdr-utils";
import {
    DocsPage,
    DocsPageResult,
    NextApp,
    convertNavigatableToResolvedPath,
    serializeSidebarNodeDescriptionMdx,
} from "@fern-ui/ui";
import { Router, useRouter } from "next/router";
import { ReactElement, useEffect, useState } from "react";

export default function LocalPreviewDocs(): ReactElement {
    const router = useRouter();

    const [docs, setDocs] = useState<DocsV2Read.LoadDocsForUrlResponse | null>(null);

    useEffect(() => {
        async function loadData() {
            const docs = await loadDocsForUrl();
            setDocs(docs);
        }
        void loadData();

        const websocket = new WebSocket(`ws://localhost:${process.env.PORT ?? 3000}`);
        websocket.onmessage = () => {
            void loadData();
        };
    }, []);

    const [docsProps, setDocsProps] = useState<DocsPage.Props | null>(null);

    useEffect(() => {
        if (docs == null) {
            return;
        }
        const slug = router.query.slug == null ? [] : (router.query.slug as string[]);
        void getDocsPageProps(docs, slug).then((props) => {
            // eslint-disable-next-line no-console
            console.debug(props);
            if (props.type === "props") {
                setDocsProps(props.props);
            } else if (props.type === "notFound") {
                void router.replace("/");
            } else if (props.type === "redirect") {
                void router.replace(props.redirect.destination);
            }
        });
    }, [docs, router]);

    if (docsProps == null) {
        return <></>;
    }

    return <NextApp router={router as Router} pageProps={docsProps} Component={DocsPage} />;
}

async function loadDocsForUrl() {
    const response = await fetch(`http://localhost:${process.env.PORT ?? 3000}/v2/registry/docs/load-with-url`, {
        method: "POST",
    });

    const docs: DocsV2Read.LoadDocsForUrlResponse = await response.json();

    return docs;
}

async function getDocsPageProps(
    docs: DocsV2Read.LoadDocsForUrlResponse,
    slug: string[],
): Promise<DocsPageResult<DocsPage.Props>> {
    const docsDefinition = docs.definition;
    const basePath = docs.baseUrl.basePath;
    const docsConfig = docsDefinition.config;

    const navigation = getNavigationRoot(slug, basePath, docsConfig.navigation, docs.definition.apis);

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
        navigation.found.sidebarNodes.map((node) => serializeSidebarNodeDescriptionMdx(node, { development: true })),
    );

    const resolvedPath = await convertNavigatableToResolvedPath({
        currentNode: navigation.found.currentNode,
        sidebarNodes,
        apis: docsDefinition.apis,
        pages: docsDefinition.pages,
        options: { development: true },
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

    const featureFlags = {
        isApiPlaygroundEnabled: false,
        isApiScrollingDisabled: false,
        isWhitelabeled: false,
    };

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
        algoliaSearchIndex: docs.definition.algoliaSearchIndex,
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
    };

    return {
        type: "props",
        props: JSON.parse(JSON.stringify(props)), // remove all undefineds
    };
}
