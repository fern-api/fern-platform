import { FernRegistry, PathResolver } from "@fern-api/fdr-sdk";
import { DocsDefinition } from "@fern-api/fdr-sdk/dist/generated/api/resources/docs/resources/v1/resources/read";
import * as FernRegistryDocsReadV2 from "@fern-api/fdr-sdk/dist/generated/api/resources/docs/resources/v2/resources/read";
import {
    convertNavigatableToResolvedPath,
    generateFontFaces,
    loadDocsBackgroundImage,
    loadDocTypography,
} from "@fern-ui/app-utils";
import { App, type ResolvedPath } from "@fern-ui/ui";
import { GetServerSideProps, GetServerSidePropsResult } from "next";
import Head from "next/head";
import { useColorTheme } from "../../utils/theme/useColorTheme";

export declare namespace Docs {
    export interface Props {
        docs: FernRegistryDocsReadV2.LoadDocsForUrlResponse;
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
}: Docs.Props): JSX.Element {
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

export const getServerSideProps: GetServerSideProps<Docs.Props> = async ({
    params = {},
}): Promise<GetServerSidePropsResult<Docs.Props>> => {
    const host = params.host as string | undefined;
    const slugArray = params.slug as string[] | undefined;

    if (host == null) {
        throw new Error("host is not defined");
    }

    const pathname = slugArray != null ? slugArray.join("/") : "";
    const previewDocsDefinition = await (
        await fetch("http://localhost:3000/docs/preview/load", {
            method: "POST",
        })
    ).json();

    const docsDefinition: DocsDefinition = {
        pages: {},
        apis: {},
        files: {},
        config: {},
        search: {
            type: "legacyMultiAlgoliaIndex",
        },
        ...previewDocsDefinition,
    };

    const typographyConfig = loadDocTypography(docsDefinition);
    const typographyStyleSheet = generateFontFaces(typographyConfig);
    const backgroundImageStyleSheet = loadDocsBackgroundImage(docsDefinition);
    type ApiDefinition = FernRegistry.api.v1.read.ApiDefinition;
    const resolver = new PathResolver({
        definition: {
            apis: docsDefinition.apis as Record<ApiDefinition["id"], ApiDefinition>,
            docsConfig: docsDefinition.config,
        },
    });
    const resolvedNavigatable = resolver.resolveNavigatable(pathname);

    if (resolvedNavigatable == null) {
        // eslint-disable-next-line no-console
        console.error(`Cannot resolve navigatable corresponding to "${pathname}"`);
        return {
            notFound: true,
        };
    }

    const resolvedPath = await convertNavigatableToResolvedPath({
        navigatable: resolvedNavigatable,
        docsDefinition: docsDefinition as FernRegistry.docs.v1.read.DocsDefinition,
        basePath: undefined,
    });

    return {
        props: {
            docs: {
                baseUrl: {
                    domain: "localhost",
                },
                definition: docsDefinition,
                lightModeEnabled: false,
            },
            typographyStyleSheet,
            backgroundImageStyleSheet: backgroundImageStyleSheet ?? null,
            resolvedPath,
        },
    };
};
