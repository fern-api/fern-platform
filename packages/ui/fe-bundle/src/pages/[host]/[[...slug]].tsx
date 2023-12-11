import { APIV1Read, DocsV1Read, DocsV2Read, PathResolver } from "@fern-api/fdr-sdk";
import {
    convertNavigatableToResolvedPath,
    generateFontFaces,
    loadDocsBackgroundImage,
    loadDocTypography,
    type ResolvedPath,
} from "@fern-ui/app-utils";
import { App, useColorTheme } from "@fern-ui/ui";
import { GetStaticPaths, GetStaticProps } from "next";
import Head from "next/head";
import { ReactElement } from "react";
import { REGISTRY_SERVICE } from "../../service";
import { buildUrl } from "../../utils/buildUrl";

export declare namespace Docs {
    export interface Props {
        docs: DocsV2Read.LoadDocsForUrlResponse;
        typographyStyleSheet?: string;
        backgroundImageStyleSheet: string | null;
        resolvedPath: ResolvedPath;
    }
}

export default function Docs({
    docs,
    typographyStyleSheet = "",
    backgroundImageStyleSheet = "",
    resolvedPath,
}: Docs.Props): ReactElement {
    const colorThemeStyleSheet = useColorTheme(docs.definition);
    return (
        <>
            <main>
                {/* 
                    We concatenate all global styles into a single instance,
                    as styled JSX will only create one instance of global styles
                    for each component.
                */}
                {/* eslint-disable-next-line react/no-unknown-property */}
                <style jsx global>
                    {`
                        ${colorThemeStyleSheet}
                        ${typographyStyleSheet}
                        ${backgroundImageStyleSheet}
                    `}
                </style>
                <Head>
                    {docs.definition.config.title != null && <title>{docs.definition.config.title}</title>}
                    {docs.definition.config.favicon != null && (
                        <link rel="icon" id="favicon" href={docs.definition.files[docs.definition.config.favicon]} />
                    )}
                </Head>
                <App docs={docs} resolvedPath={resolvedPath} />
            </main>
        </>
    );
}

export const getStaticProps: GetStaticProps<Docs.Props> = async ({ params = {} }) => {
    const host = params.host as string | undefined;
    const slugArray = params.slug as string[] | undefined;

    if (host == null) {
        throw new Error("host is not defined");
    }

    const pathname = slugArray != null ? slugArray.join("/") : "";
    const docs = await REGISTRY_SERVICE.docs.v2.read.getDocsForUrl({
        url: process.env.NEXT_PUBLIC_DOCS_DOMAIN ?? buildUrl({ host, pathname }),
    });

    if (!docs.ok) {
        // eslint-disable-next-line no-console
        console.error(`Failed to fetch docs for path: /${pathname}`, docs.error);
        return {
            notFound: true,
            revalidate: false,
        };
    }

    const docsDefinition = docs.body.definition;
    const typographyConfig = loadDocTypography(docsDefinition);
    const typographyStyleSheet = generateFontFaces(typographyConfig);
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
        return {
            notFound: true,
            revalidate: false,
        };
    }

    const resolvedPath = await convertNavigatableToResolvedPath({
        navigatable: resolvedNavigatable,
        docsDefinition: docsDefinition as DocsV1Read.DocsDefinition,
        basePath: docs.body.baseUrl.basePath,
    });

    return {
        props: {
            docs: docs.body,
            typographyStyleSheet,
            backgroundImageStyleSheet: backgroundImageStyleSheet ?? null,
            resolvedPath,
        },
    };
};

export const getStaticPaths: GetStaticPaths = () => {
    return { paths: [], fallback: "blocking" };
};
