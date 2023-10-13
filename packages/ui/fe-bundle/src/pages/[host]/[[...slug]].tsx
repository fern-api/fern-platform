import * as FernRegistryDocsReadV2 from "@fern-fern/registry-browser/api/resources/docs/resources/v2/resources/read";
import { getSlugFromUrl, PathResolver } from "@fern-ui/app-utils";
import { App, type ResolvedPath } from "@fern-ui/ui";
import { GetStaticPaths, GetStaticProps } from "next";
import Head from "next/head";
import { REGISTRY_SERVICE } from "../../service";
import { buildUrl } from "../../utils/buildUrl";
import { convertNavigatableToResolvedPath } from "../../utils/convertNavigatableToResolvedPath";
import { loadDocsBackgroundImage } from "../../utils/theme/loadDocsBackgroundImage";
import { generateFontFaces, loadDocTypography } from "../../utils/theme/loadDocsTypography";
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

    const docsDefinition = docs.body.definition;
    const typographyConfig = loadDocTypography(docsDefinition);
    const typographyStyleSheet = generateFontFaces(typographyConfig);
    const backgroundImageStyleSheet = loadDocsBackgroundImage(docsDefinition);
    const resolver = new PathResolver({ docsDefinition });
    const slug = getSlugFromUrl({ pathname, basePath: docs.body.baseUrl.basePath });
    const resolvedNavigatable = resolver.resolveNavigatable(slug);

    if (resolvedNavigatable == null) {
        // eslint-disable-next-line no-console
        console.error(`Cannot resolve navigatable corresponding to "${slug}"`);
        return {
            notFound: true,
            revalidate: false,
        };
    }

    const resolvedPath = await convertNavigatableToResolvedPath({
        navigatable: resolvedNavigatable,
        docsDefinition,
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
