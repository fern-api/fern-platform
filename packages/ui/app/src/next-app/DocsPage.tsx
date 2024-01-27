import { APIV1Read, DocsV2Read, NavigatableDocsNode, PathResolver } from "@fern-api/fdr-sdk";
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
import { useColorTheme } from "../hooks/useColorTheme";
import { REGISTRY_SERVICE } from "../services/registry";
import { buildUrl } from "../util/buildUrl";
import { DocsApp } from "./DocsApp";

export declare namespace DocsPage {
    export interface Props {
        docs: DocsV2Read.LoadDocsForUrlResponse;
        typographyStyleSheet?: string;
        backgroundImageStyleSheet: string | null;
        resolvedPath: ResolvedPath;
    }
}

export function DocsPage({
    docs,
    typographyStyleSheet = "",
    backgroundImageStyleSheet = "",
    resolvedPath,
}: DocsPage.Props): ReactElement {
    const colorThemeStyleSheet = useColorTheme(docs.definition);
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
                {docs.definition.config.title != null && <title>{docs.definition.config.title}</title>}
                {docs.definition.config.favicon != null && (
                    <link rel="icon" id="favicon" href={docs.definition.files[docs.definition.config.favicon]} />
                )}
            </Head>
            <DocsApp docs={docs} resolvedPath={resolvedPath} />
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

    const resolvedNavigatable = getResolvedNavigatable(docs.body, pathname);

    if (resolvedNavigatable == null) {
        // eslint-disable-next-line no-console
        console.error(`Cannot resolve navigatable corresponding to "${pathname}"`);
        return {
            type: "notFound",
            notFound: true,
            revalidate: 60 * 60, // 1 hour
        };
    }

    return {
        type: "props",
        props: await createDocsPageProps(docs.body, resolvedNavigatable),
        revalidate: 60 * 60 * 24 * 6, // 6 days
    };
};

export const getResolvedNavigatable = (
    docs: DocsV2Read.LoadDocsForUrlResponse,
    pathname: string
): NavigatableDocsNode | undefined => {
    const { definition: docsDefinition, baseUrl } = docs;
    type ApiDefinition = APIV1Read.ApiDefinition;
    const resolver = new PathResolver({
        definition: {
            apis: docsDefinition.apis as Record<ApiDefinition["id"], ApiDefinition>,
            docsConfig: docsDefinition.config,
            basePath: baseUrl.basePath,
        },
    });
    return resolver.resolveNavigatable(pathname);
};

export const createDocsPageProps = async (
    docs: DocsV2Read.LoadDocsForUrlResponse,
    resolvedNavigatable: NavigatableDocsNode
): Promise<DocsPage.Props> => {
    const resolvedPath = await convertNavigatableToResolvedPath({
        navigatable: resolvedNavigatable,
        docsDefinition: docs.definition,
        basePath: docs.baseUrl.basePath,
    });

    const typographyStyleSheet = generateFontFaces(docs.definition.config.typographyV2, docs.definition.files);
    const backgroundImageStyleSheet = loadDocsBackgroundImage(docs.definition);
    return {
        docs,
        typographyStyleSheet,
        backgroundImageStyleSheet: backgroundImageStyleSheet ?? null,
        resolvedPath,
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
