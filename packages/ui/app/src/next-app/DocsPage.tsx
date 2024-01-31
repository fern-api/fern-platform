import { APIV1Read, DocsV1Read, DocsV2Read, FdrAPI, PathResolver } from "@fern-api/fdr-sdk";
import {
    convertNavigatableToResolvedPath,
    generateFontFaces,
    loadDocsBackgroundImage,
    type ResolvedPath,
} from "@fern-ui/app-utils";
import { visitDiscriminatedUnion } from "@fern-ui/core-utils";
import { compact } from "lodash-es";
import { GetStaticProps, Redirect } from "next";
import Head from "next/head";
import { ReactElement } from "react";
import { capturePosthogEvent, initializePosthog } from "../analytics/posthog";
import { useColorTheme } from "../hooks/useColorTheme";
import { REGISTRY_SERVICE } from "../services/registry";
import { buildUrl } from "../util/buildUrl";
import { DocsApp } from "./DocsApp";

export declare namespace DocsPage {
    export interface Props {
        // docs: DocsV2Read.LoadDocsForUrlResponse;
        baseUrl: DocsV2Read.BaseUrl;
        config: DocsV1Read.DocsConfig;
        search: DocsV1Read.SearchInfo;
        algoliaSearchIndex: DocsV1Read.AlgoliaSearchIndex | null;
        files: Record<DocsV1Read.FileId, DocsV1Read.Url>;
        apis: Record<FdrAPI.ApiId, APIV1Read.ApiDefinition>;
        typographyStyleSheet: string;
        backgroundImageStyleSheet: string;
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
    typographyStyleSheet,
    backgroundImageStyleSheet,
    resolvedPath,
}: DocsPage.Props): ReactElement {
    const colorThemeStyleSheet = useColorTheme(config);
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
                    ${colorThemeStyleSheet}
                    \n${typographyStyleSheet}
                    ${backgroundImageStyleSheet}
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
            />
        </>
    );
}

export type DocsPageResult<Props> =
    | { type: "props"; props: Props; revalidate?: number | boolean }
    | { type: "redirect"; redirect: Redirect; revalidate?: number | boolean }
    | { type: "notFound"; notFound: true; revalidate?: number | boolean };

export const getDocsPageProps = async (
    xFernHost: string | undefined,
    slugArray: string[]
): Promise<DocsPageResult<DocsPage.Props>> => {
    try {
        initializePosthog();
    } catch (e) {
        // eslint-disable-next-line no-console
        console.error("Failed to initialize Posthog", e);
    }

    if (xFernHost == null || Array.isArray(xFernHost)) {
        return { type: "notFound", notFound: true };
    }

    const pathname = slugArray != null ? slugArray.join("/") : "";
    const docs = await REGISTRY_SERVICE.docs.v2.read.getDocsForUrl({
        url: buildUrl({ host: xFernHost, pathname }),
    });

    capturePosthogEvent("static_generate_docs_page", {
        host: xFernHost,
        path: pathname,
        ok: docs.ok,
    });

    if (!docs.ok) {
        // eslint-disable-next-line no-console
        console.error(`Failed to fetch docs for path: /${pathname}`, docs.error);
        capturePosthogEvent("static_generate_docs_page_error", {
            host: xFernHost,
            path: pathname,
            error: docs.error,
        });
        return {
            type: "notFound",
            notFound: true,
            revalidate: 60,
        };
    }

    const docsDefinition = docs.body.definition;
    const typographyStyleSheet = generateFontFaces(docsDefinition.config.typographyV2, docsDefinition.files);
    const backgroundImageStyleSheet = loadDocsBackgroundImage(docsDefinition);
    type ApiDefinition = APIV1Read.ApiDefinition;
    const resolver = new PathResolver({
        definition: {
            apis: docs.body.definition.apis as Record<ApiDefinition["id"], ApiDefinition>,
            docsConfig: docs.body.definition.config,
            basePath: docs.body.baseUrl.basePath,
        },
    });
    const resolvedNavigatable = resolver.resolveNavigatable(pathname);

    if (resolvedNavigatable == null) {
        // eslint-disable-next-line no-console
        console.error(`Cannot resolve navigatable corresponding to "${pathname}"`);
        capturePosthogEvent("static_generate_docs_page_error", {
            host: xFernHost,
            path: pathname,
            error: `Cannot resolve navigatable corresponding to "${pathname}"`,
        });
        return {
            type: "notFound",
            notFound: true,
            revalidate: 60 * 60, // 1 hour
        };
    }

    const resolvedPath = await convertNavigatableToResolvedPath({
        navigatable: resolvedNavigatable,
        docsDefinition: docsDefinition as DocsV1Read.DocsDefinition,
        basePath: docs.body.baseUrl.basePath,
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
            typographyStyleSheet,
            backgroundImageStyleSheet: backgroundImageStyleSheet ?? "",
            resolvedPath,
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
