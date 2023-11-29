import { APIV1Read, DocsV1Read, DocsV2Read, FdrClient, PathResolver } from "@fern-api/fdr-sdk";
import {
    convertNavigatableToResolvedPath,
    generateFontFaces,
    loadDocsBackgroundImage,
    loadDocTypography,
    type ResolvedPath,
} from "@fern-ui/app-utils";
import { App } from "@fern-ui/ui";
import { compact } from "lodash-es";
import Head from "next/head";
import { useRouter } from "next/router";
import { ReactElement, useEffect, useState } from "react";
import { useColorTheme } from "../../useColorTheme";

export declare namespace Docs {
    export interface Props {
        docs: DocsV2Read.LoadDocsForUrlResponse;
        typographyStyleSheet?: string;
        backgroundImageStyleSheet: string | null;
        resolvedPath: ResolvedPath;
    }
}

export default function LocalPreviewDocs(): ReactElement {
    const router = useRouter();
    const [docsProps, setDocsProps] = useState<Docs.Props | null>(null);

    useEffect(() => {
        if (router.asPath === "/[host]/[[...slug]]") {
            return;
        }
        async function loadData() {
            const slugArray = compact(router.asPath.split("/"));
            const props = await getInitialProps(slugArray);
            setDocsProps(props);
        }
        void loadData();
    }, [router.asPath]);

    if (docsProps == null) {
        return <div>Loading...</div>;
    }

    return <Docs {...docsProps} />;
}

function Docs({
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

const REGISTRY_SERVICE = new FdrClient({
    environment: "http://localhost:3000",
});

async function getInitialProps(slugArray: string[]): Promise<Docs.Props> {
    const pathname = slugArray != null ? slugArray.join("/") : "";
    const docs = await REGISTRY_SERVICE.docs.v2.read.getDocsForUrl({
        url: buildUrl({ host: "localhost:3000", pathname }),
    });

    if (!docs.ok) {
        // eslint-disable-next-line no-console
        console.error(`Failed to fetch docs for path: /${pathname}`, docs.error);
        throw new Error(`Failed to fetch docs for path: /${pathname}`);
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
        throw new Error(`Cannot resolve navigatable corresponding to "${pathname}"`);
    }

    const resolvedPath = await convertNavigatableToResolvedPath({
        navigatable: resolvedNavigatable,
        docsDefinition: docsDefinition as DocsV1Read.DocsDefinition,
        basePath: docs.body.baseUrl.basePath,
    });

    return {
        docs: docs.body,
        typographyStyleSheet,
        backgroundImageStyleSheet: backgroundImageStyleSheet ?? null,
        resolvedPath,
    };
}

function buildUrl({ host, pathname }: { host: string; pathname: string }): string {
    const hostWithoutTrailingSlash = host.endsWith("/") ? host.slice(0, -1) : host;
    if (pathname.length === 0) {
        return hostWithoutTrailingSlash;
    }
    return `${hostWithoutTrailingSlash}/${pathname}`;
}
