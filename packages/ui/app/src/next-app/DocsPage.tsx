import { APIV1Read, DocsV1Read, DocsV2Read, FdrAPI, NavigatableDocsNode, PathResolver } from "@fern-api/fdr-sdk";
import { visitDiscriminatedUnion } from "@fern-ui/core-utils";
import { compact } from "lodash-es";
import { GetStaticProps, Redirect } from "next";
import Head from "next/head";
import Script from "next/script";
import { ReactElement } from "react";
import { REGISTRY_SERVICE } from "../services/registry";
import { resolveSidebarNodes, SidebarNavigation } from "../sidebar/types";
import { buildUrl } from "../util/buildUrl";
import { convertNavigatableToResolvedPath } from "../util/convertNavigatableToResolvedPath";
import { type ResolvedPath } from "../util/ResolvedPath";
import { DocsApp } from "./DocsApp";
import { renderThemeStylesheet } from "./utils/renderThemeStylesheet";

export declare namespace DocsPage {
    export interface Props {
        // docs: DocsV2Read.LoadDocsForUrlResponse;
        baseUrl: DocsV2Read.BaseUrl;
        navigation: SidebarNavigation;

        title: string | undefined;
        favicon: string | undefined;
        backgroundImage: string | undefined;
        colors: DocsV1Read.ColorsConfigV3 | undefined;
        layout: DocsV1Read.DocsLayoutConfig | undefined;
        typography: DocsV1Read.DocsTypographyConfigV2 | undefined;
        css: DocsV1Read.CssConfig | undefined;
        js: DocsV1Read.JsConfig | undefined;
        navbarLinks: DocsV1Read.NavbarLink[];
        logo: DocsV1Read.FileId | undefined;
        logoV2: DocsV1Read.LogoV2 | undefined;
        logoHeight: DocsV1Read.Height | undefined;
        logoHref: DocsV1Read.Url | undefined;

        search: DocsV1Read.SearchInfo;
        algoliaSearchIndex: DocsV1Read.AlgoliaSearchIndex | undefined;
        files: Record<DocsV1Read.FileId, DocsV1Read.File_>;
        resolvedPath: ResolvedPath;
    }
}

export function DocsPage({
    baseUrl,
    title,
    favicon,
    backgroundImage,
    colors,
    typography,
    layout,
    css,
    js,
    navbarLinks,
    logo,
    logoV2,
    logoHeight,
    logoHref,
    search,
    algoliaSearchIndex,
    files,
    resolvedPath,
    navigation,
}: DocsPage.Props): ReactElement {
    const stylesheet = renderThemeStylesheet(backgroundImage, colors, typography, layout, css, files);
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
                {title != null && <title>{title}</title>}
                {favicon != null && <link rel="icon" id="favicon" href={files[favicon]?.url} />}
            </Head>
            <DocsApp
                baseUrl={baseUrl}
                hasBackgroundImage={backgroundImage != null}
                colors={colors}
                logo={logo}
                logoV2={logoV2}
                logoHeight={logoHeight}
                logoHref={logoHref}
                layout={layout}
                navbarLinks={navbarLinks}
                search={search}
                algoliaSearchIndex={algoliaSearchIndex}
                files={files}
                resolvedPath={resolvedPath}
                navigation={navigation}
            />
            {js?.inline?.map((inline, idx) => (
                <Script key={`inline-script-${idx}`} id={`inline-script-${idx}`}>
                    {inline}
                </Script>
            ))}
            {js?.files.map((file) => (
                <Script key={file.fileId} src={files[file.fileId]?.url} strategy={file.strategy} />
            ))}
            {js?.remote?.map((remote) => <Script key={remote.url} src={remote.url} strategy={remote.strategy} />)}
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

    const { apis, config: docsConfig } = docsDefinition;
    const resolver = new PathResolver({ definition: { apis, docsConfig, basePath } });

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

    const versionAndTabSlug = getVersionAndTabSlug(basePath, navigatable);

    const resolvedPath = await convertNavigatableToResolvedPath({
        resolver,
        navigatable,
        docsDefinition,
        basePath,
        parentSlugs: versionAndTabSlug,
    });

    if (resolvedPath == null) {
        // eslint-disable-next-line no-console
        console.error(`Cannot convert navigatable to resolved path: "${pathname}"`);
        return {
            type: "notFound",
            notFound: true,
            revalidate: 60 * 60, // 1 hour
        };
    }

    const navigation = await getNavigation(basePath, docs.body.definition.apis, navigatable);

    return {
        type: "props",
        props: JSON.parse(
            JSON.stringify({
                // docs: docs.body,
                baseUrl: docs.body.baseUrl,
                layout: docs.body.definition.config.layout,
                title: docs.body.definition.config.title,
                favicon: docs.body.definition.config.favicon,
                backgroundImage: docs.body.definition.config.backgroundImage,
                colors: docs.body.definition.config.colorsV3,
                typography: docs.body.definition.config.typographyV2,
                css: docs.body.definition.config.css,
                js: docs.body.definition.config.js,
                navbarLinks: docs.body.definition.config.navbarLinks ?? [],
                logo: docs.body.definition.config.logo,
                logoV2: docs.body.definition.config.logoV2,
                logoHeight: docs.body.definition.config.logoHeight,
                logoHref: docs.body.definition.config.logoHref,
                search: docs.body.definition.search,
                algoliaSearchIndex: docs.body.definition.algoliaSearchIndex,
                files: docs.body.definition.filesV2,
                resolvedPath,
                navigation,
            }),
        ),
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

export function getVersionAndTabSlug(basePath: string | undefined, navigatable: NavigatableDocsNode): string[] {
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

async function getNavigation(
    basePath: string | undefined,
    apis: Record<FdrAPI.ApiId, APIV1Read.ApiDefinition>,
    navigatable: NavigatableDocsNode,
): Promise<SidebarNavigation> {
    const versionAndTabSlug = getVersionAndTabSlug(basePath, navigatable);

    const currentNavigationItems =
        navigatable.context.type === "versioned-tabbed" || navigatable.context.type === "unversioned-tabbed"
            ? navigatable.context.tab?.items
            : navigatable.context.navigationConfig.items;

    const sidebarNodes = await resolveSidebarNodes(currentNavigationItems, apis, versionAndTabSlug);

    return {
        currentTabIndex: navigatable.context.tab?.index,
        tabs:
            navigatable.context.type === "versioned-tabbed" || navigatable.context.type === "unversioned-tabbed"
                ? navigatable.context.navigationConfig.tabs.map((tab) => ({
                      title: tab.title,
                      icon: tab.icon,
                      urlSlug: tab.urlSlug,
                  }))
                : [],
        currentVersionIndex: navigatable.context.version?.info.index,
        versions:
            navigatable.context.root.info.type === "versioned"
                ? navigatable.context.root.info.versions.map((version) => version.info)
                : [],
        sidebarNodes,
    };
}
