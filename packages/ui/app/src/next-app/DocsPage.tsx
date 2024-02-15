import { APIV1Read, DocsV1Read, DocsV2Read, FdrAPI, NavigatableDocsNode, PathResolver } from "@fern-api/fdr-sdk";
import { convertNavigatableToResolvedPath, type ResolvedPath } from "@fern-ui/app-utils";
import { visitDiscriminatedUnion } from "@fern-ui/core-utils";
import { compact } from "lodash-es";
import { GetStaticProps, Redirect } from "next";
import Head from "next/head";
import Script from "next/script";
import { ReactElement } from "react";
import { REGISTRY_SERVICE } from "../services/registry";
import { resolveSidebarNodes, SidebarNode } from "../sidebar/types";
import { buildUrl } from "../util/buildUrl";
import { DocsApp } from "./DocsApp";
import { renderThemeStylesheet } from "./utils/renderThemeStylesheet";

export declare namespace DocsPage {
    export interface Props {
        // docs: DocsV2Read.LoadDocsForUrlResponse;
        baseUrl: DocsV2Read.BaseUrl;
        navigation: SidebarNode[];
        config: DocsV1Read.DocsConfig;
        search: DocsV1Read.SearchInfo;
        algoliaSearchIndex: DocsV1Read.AlgoliaSearchIndex | null;
        files: Record<DocsV1Read.FileId, DocsV1Read.Url>;
        apis: Record<FdrAPI.ApiId, APIV1Read.ApiDefinition>;
        resolvedPath: ResolvedPath;
    }
}

export function DocsPage({
    baseUrl,
    config,
    search,
    algoliaSearchIndex,
    files,
    apis,
    resolvedPath,
    navigation,
}: DocsPage.Props): ReactElement {
    const stylesheet = renderThemeStylesheet(config, files);
    return (
        <>
            {/* 
                    We concatenate all global styles into a single instance,
                    as styled JSX will only create one instance of global styles
                    for each component.
                */}
            {/* eslint-disable-next-line react/no-unknown-property */}
            <style jsx global>
                {`
                    ${stylesheet}
                `}
            </style>
            <Head>
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
                />
                {config.title != null && <title>{config.title}</title>}
                {config.favicon != null && <link rel="icon" id="favicon" href={files[config.favicon]} />}
            </Head>
            <DocsApp
                baseUrl={baseUrl}
                config={config}
                search={search}
                algoliaSearchIndex={algoliaSearchIndex}
                files={files}
                apis={apis}
                resolvedPath={resolvedPath}
                navigation={navigation}
            />
            {config.js?.inline?.map((inline, idx) => (
                <Script key={`inline-script-${idx}`} id={`inline-script-${idx}`}>
                    {inline}
                </Script>
            ))}
            {config.js?.files.map((file) => (
                <Script key={file.fileId} src={files[file.fileId]} strategy={file.strategy} />
            ))}
            {config.js?.remote?.map((remote) => (
                <Script key={remote.url} src={remote.url} strategy={remote.strategy} />
            ))}
        </>
    );
}

export type DocsPageResult<Props> =
    | { type: "props"; props: Props; revalidate?: number | boolean }
    | { type: "redirect"; redirect: Redirect; revalidate?: number | boolean }
    | { type: "notFound"; notFound: true; revalidate?: number | boolean };

export const getDocsPageProps = async (
    xFernHost: string | undefined,
    slugArray: string[],
): Promise<DocsPageResult<DocsPage.Props>> => {
    if (xFernHost == null || Array.isArray(xFernHost)) {
        return { type: "notFound", notFound: true };
    }

    const pathname = slugArray != null ? slugArray.join("/") : "";
    const docs = await REGISTRY_SERVICE.docs.v2.read.getDocsForUrl({
        url: buildUrl({ host: xFernHost, pathname }),
    });

    if (!docs.ok) {
        // eslint-disable-next-line no-console
        console.error(`Failed to fetch docs for path: /${pathname}`, docs.error);
        return {
            type: "notFound",
            notFound: true,
            revalidate: 60,
        };
    }

    const docsDefinition = docs.body.definition;
    const basePath = docs.body.baseUrl.basePath;

    type ApiDefinition = APIV1Read.ApiDefinition;
    const resolver = new PathResolver({
        definition: {
            apis: docs.body.definition.apis as Record<ApiDefinition["id"], ApiDefinition>,
            docsConfig: docs.body.definition.config,
            basePath,
        },
    });

    if (pathname === "wss/transcribe") {
        const navigatable = resolver.resolveNavigatable("");
        if (navigatable != null) {
            const navigation = getNavigation(basePath, docs.body.definition.apis, navigatable);

            navigation.push({
                type: "apiSection",
                api: "wss",
                id: "wss",
                title: "Real-time",
                slug: ["wss"],
                endpoints: [],
                webhooks: [],
                websockets: [
                    {
                        id: "assembly-websocket",
                        title: "Transcription",
                        slug: ["wss", "transcribe"],
                    },
                ],
                subpackages: [],
                artifacts: null,
            });

            return {
                type: "props",
                props: {
                    // docs: docs.body,
                    baseUrl: docs.body.baseUrl,
                    config: docs.body.definition.config,
                    search: docs.body.definition.search,
                    algoliaSearchIndex: docs.body.definition.algoliaSearchIndex ?? null,
                    files: docs.body.definition.files,
                    apis: docs.body.definition.apis,
                    resolvedPath: {
                        type: "api-page",
                        fullSlug: "wss-transcribe",
                        apiSection: {
                            api: "wss-transcribe",
                            title: "Real-time transcription",
                            urlSlug: "wss-transcribe",
                            skipUrlSlug: false,
                            showErrors: false,
                        },
                        neighbors: {
                            next: null,
                            prev: null,
                        },
                    },
                    navigation,
                },
                revalidate: 60 * 60, // 1 hour
            };
        }
    }

    if (pathname === "wss/chat") {
        const navigatable = resolver.resolveNavigatable("");
        if (navigatable != null) {
            const navigation = getNavigation(basePath, docs.body.definition.apis, navigatable);

            navigation.push({
                type: "apiSection",
                api: "wss",
                id: "wss",
                title: "Streaming",
                slug: ["wss"],
                endpoints: [],
                webhooks: [],
                websockets: [
                    {
                        id: "hume-websocket",
                        title: "Real-time Chat API",
                        slug: ["wss", "chat"],
                    },
                ],
                subpackages: [],
                artifacts: null,
            });

            return {
                type: "props",
                props: {
                    // docs: docs.body,
                    baseUrl: docs.body.baseUrl,
                    config: docs.body.definition.config,
                    search: docs.body.definition.search,
                    algoliaSearchIndex: docs.body.definition.algoliaSearchIndex ?? null,
                    files: docs.body.definition.files,
                    apis: docs.body.definition.apis,
                    resolvedPath: {
                        type: "api-page",
                        fullSlug: "wss-chat",
                        apiSection: {
                            api: "wss-chat",
                            title: "Real-time Chat API",
                            urlSlug: "wss-chat",
                            skipUrlSlug: false,
                            showErrors: false,
                        },
                        neighbors: {
                            next: null,
                            prev: null,
                        },
                    },
                    navigation,
                },
                revalidate: 60 * 60, // 1 hour
            };
        }
    }

    if (pathname === "fern-test/websocket-example") {
        const navigatable = resolver.resolveNavigatable("");
        if (navigatable != null) {
            const navigation = getNavigation(basePath, docs.body.definition.apis, navigatable);

            navigation.push({
                type: "apiSection",
                api: "fern-test",
                id: "fern-test",
                title: "Fern Test",
                slug: ["fern-test"],
                endpoints: [],
                webhooks: [],
                websockets: [
                    {
                        id: "websocket-example",
                        title: "Websocket Example",
                        slug: ["fern-test", "websocket-example"],
                    },
                ],
                subpackages: [],
                artifacts: null,
            });

            return {
                type: "props",
                props: {
                    // docs: docs.body,
                    baseUrl: docs.body.baseUrl,
                    config: docs.body.definition.config,
                    search: docs.body.definition.search,
                    algoliaSearchIndex: docs.body.definition.algoliaSearchIndex ?? null,
                    files: docs.body.definition.files,
                    apis: docs.body.definition.apis,
                    resolvedPath: {
                        type: "api-page",
                        fullSlug: "fern-websocket-example",
                        apiSection: {
                            api: "fern-websocket-example",
                            title: "Fern Websocket Example",
                            urlSlug: "fern-websocket-example",
                            skipUrlSlug: false,
                            showErrors: false,
                        },
                        neighbors: {
                            next: null,
                            prev: null,
                        },
                    },
                    navigation,
                },
                revalidate: 60 * 60, // 1 hour
            };
        }
    }

    const navigatable = resolver.resolveNavigatable(pathname);

    if (navigatable == null) {
        // eslint-disable-next-line no-console
        console.error(`Cannot resolve navigatable corresponding to "${pathname}"`);
        return {
            type: "notFound",
            notFound: true,
            revalidate: 60 * 60, // 1 hour
        };
    }

    const resolvedPath = await convertNavigatableToResolvedPath({
        resolver,
        navigatable,
        docsDefinition,
        basePath,
    });

    const navigation = getNavigation(basePath, docs.body.definition.apis, navigatable);

    return {
        type: "props",
        props: {
            // docs: docs.body,
            baseUrl: docs.body.baseUrl,
            config: docs.body.definition.config,
            search: docs.body.definition.search,
            algoliaSearchIndex: docs.body.definition.algoliaSearchIndex ?? null,
            files: docs.body.definition.files,
            apis: docs.body.definition.apis,
            resolvedPath,
            navigation,
        },
        revalidate: 60 * 60 * 24 * 6, // 6 days
    };
};

export const getDocsPageStaticProps: GetStaticProps<DocsPage.Props> = async ({ params = {} }) => {
    const xFernHost = process.env.NEXT_PUBLIC_DOCS_DOMAIN ?? (params.host as string);
    const slugArray = compact(params.slug);

    const result = await getDocsPageProps(xFernHost, slugArray);

    return visitDiscriminatedUnion(result, "type")._visit<ReturnType<GetStaticProps<DocsPage.Props>>>({
        notFound: (notFound) => ({ notFound: true, revalidate: notFound.revalidate }),
        redirect: (redirect) => ({ redirect: redirect.redirect, revalidate: redirect.revalidate }),
        props: (props) => ({ props: props.props, revalidate: props.revalidate }),
        _other: () => ({ notFound: true }),
    });
};

function getVersionAndTabSlug(basePath: string | undefined, navigatable: NavigatableDocsNode) {
    const versionAndTabSlug = [];
    if (basePath != null) {
        versionAndTabSlug.push(...basePath.split("/").filter((s) => s.length > 0));
    }
    if (navigatable.context.type === "versioned-tabbed" || navigatable.context.type === "versioned-untabbed") {
        if (navigatable.context.version.info.index !== 0) {
            versionAndTabSlug.push(navigatable.context.version.slug);
        }
    }
    if (navigatable.context.type === "versioned-tabbed" || navigatable.context.type === "unversioned-tabbed") {
        versionAndTabSlug.push(navigatable.context.tab.slug);
    }
    return versionAndTabSlug;
}
function getNavigation(
    basePath: string | undefined,
    apis: Record<FdrAPI.ApiId, APIV1Read.ApiDefinition>,
    navigatable: NavigatableDocsNode,
) {
    const versionAndTabSlug = getVersionAndTabSlug(basePath, navigatable);

    const currentNavigationItems =
        navigatable.context.type === "versioned-tabbed" || navigatable.context.type === "unversioned-tabbed"
            ? navigatable.context.tab?.items
            : navigatable.context.navigationConfig.items;

    return resolveSidebarNodes(currentNavigationItems, apis, versionAndTabSlug);
}
