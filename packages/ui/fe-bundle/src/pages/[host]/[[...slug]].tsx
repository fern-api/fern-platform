import * as FernRegistryDocsReadV2 from "@fern-fern/registry-browser/api/resources/docs/resources/v2/resources/read";
import { getSlugFromUrl, PathResolver, type NavigatableDocsNode } from "@fern-ui/app-utils";
import { App } from "@fern-ui/ui";
import { GetStaticPaths, GetStaticProps } from "next";
import Head from "next/head";
import { REGISTRY_SERVICE } from "../../service";
import { loadDocsBackgroundImage } from "../../utils/theme/loadDocsBackgroundImage";
import { generateFontFaces, loadDocTypography } from "../../utils/theme/loadDocsTypography";
import { useColorTheme } from "../../utils/theme/useColorTheme";

export declare namespace Docs {
    export interface Props {
        docs: FernRegistryDocsReadV2.LoadDocsForUrlResponse;
        typographyStyleSheet?: string;
        backgroundImageStyleSheet: string | null;
        resolvedNavigatable: NavigatableDocsNode;
        nextNavigatable: NavigatableDocsNode | null;
        previousNavigatable: NavigatableDocsNode | null;
    }
}

export default function Docs({
    docs,
    typographyStyleSheet = "",
    backgroundImageStyleSheet = "",
    resolvedNavigatable,
    nextNavigatable,
    previousNavigatable,
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
                <App
                    docs={docs}
                    resolvedNavigatable={resolvedNavigatable}
                    nextNavigatable={nextNavigatable ?? undefined}
                    previousNavigatable={previousNavigatable ?? undefined}
                />
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
        console.error("Failed to fetch docs", docs.error);
        return {
            notFound: true,
            revalidate: false,
        };
    }

    const typographyConfig = loadDocTypography(docs.body.definition);
    const typographyStyleSheet = generateFontFaces(typographyConfig);
    const backgroundImageStyleSheet = loadDocsBackgroundImage(docs.body.definition);

    const slug = getSlugFromUrl({ pathname, basePath: docs.body.baseUrl.basePath });
    const resolver = new PathResolver({ docsDefinition: docs.body.definition });
    const resolvedNavigatable = resolver.resolveNavigatable(slug);

    if (resolvedNavigatable == null) {
        // eslint-disable-next-line no-console
        console.error(`Cannot resolve navigatable corresponding to "${slug}"`);
        return {
            notFound: true,
            revalidate: false,
        };
    }

    // TODO: Implement
    const [previousNavigatable, nextNavigatable] = await Promise.all([null, null]);

    return {
        success: true,
        props: {
            docs: docs.body,
            inferredVersionSlug: null,
            typographyStyleSheet,
            backgroundImageStyleSheet: backgroundImageStyleSheet ?? null,
            resolvedNavigatable,
            previousNavigatable: previousNavigatable ?? null,
            nextNavigatable: nextNavigatable ?? null,
        },
    };
};

export const getStaticPaths: GetStaticPaths = () => {
    return { paths: [], fallback: "blocking" };
};

function buildUrl({ host, pathname }: { host: string; pathname: string }): string {
    const hostWithoutTrailingSlash = host.endsWith("/") ? host.slice(0, -1) : host;
    if (pathname.length === 0) {
        return hostWithoutTrailingSlash;
    }
    return `${hostWithoutTrailingSlash}/${pathname}`;
}
