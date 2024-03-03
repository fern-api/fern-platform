import { APIV1Read, DocsV1Read, DocsV2Read, FdrAPI } from "@fern-api/fdr-sdk";
import { visitDiscriminatedUnion } from "@fern-ui/core-utils";
import { compact } from "lodash-es";
import { GetServerSideProps, GetStaticProps, Redirect } from "next";
import Head from "next/head";
import Script from "next/script";
import { ReactElement } from "react";
import { REGISTRY_SERVICE } from "../services/registry";
import { resolveSidebarNodes, SidebarNavigation, SidebarTab, SidebarVersionInfo } from "../sidebar/types";
import { buildUrl } from "../util/buildUrl";
import { convertNavigatableToResolvedPath } from "../util/convertNavigatableToResolvedPath";
import {
    isUnversionedTabbedNavigationConfig,
    isUnversionedUntabbedNavigationConfig,
    isVersionedNavigationConfig,
} from "../util/fern";
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

    const pathname = decodeURI(slugArray != null ? slugArray.join("/") : "");
    const url = buildUrl({ host: xFernHost, pathname });
    const docs = await REGISTRY_SERVICE.docs.v2.read.getDocsForUrl({ url });

    if (!docs.ok) {
        // eslint-disable-next-line no-console
        console.error(`Failed to fetch docs for ${url}`, docs.error);
        return {
            type: "notFound",
            notFound: true,
            revalidate: 60,
        };
    }

    const docsDefinition = docs.body.definition;
    const basePath = docs.body.baseUrl.basePath;
    const docsConfig = docsDefinition.config;

    const navigation = await getNavigation(slugArray, basePath, docs.body.definition.apis, docsConfig.navigation);

    if (navigation == null) {
        // eslint-disable-next-line no-console
        console.error(`Failed to resolve navigation for ${url}`);
        return { type: "notFound", notFound: true };
    }

    const resolvedPath = await convertNavigatableToResolvedPath({
        slug: slugArray,
        sidebarNodes: navigation.sidebarNodes,
        apis: docsDefinition.apis,
        pages: docsDefinition.pages,
    });

    if (resolvedPath == null) {
        // eslint-disable-next-line no-console
        console.error(`Failed to resolve path for ${url}`);
        return {
            type: "notFound",
            notFound: true,
            revalidate: 60 * 60, // 1 hour
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

export const getDocsServerSideProps: GetServerSideProps<DocsPage.Props> = async ({ params = {} }) => {
    const xFernHost = process.env.NEXT_PUBLIC_DOCS_DOMAIN ?? (params.host as string);
    const slugArray = compact(params.slug);

    const result = await getDocsPageProps(xFernHost, slugArray);

    return visitDiscriminatedUnion(result, "type")._visit<ReturnType<GetServerSideProps<DocsPage.Props>>>({
        notFound: () => Promise.resolve({ notFound: true }),
        redirect: (redirect) => Promise.resolve({ redirect: redirect.redirect }),
        props: (props) => Promise.resolve({ props: props.props }),
        _other: () => Promise.resolve({ notFound: true }),
    });
};

export function getVersionAndTabSlug(
    slugArray: string[],
    basePath: string | undefined,
    nav: DocsV1Read.NavigationConfig,
): string[] | undefined {
    let currentPath = slugArray;

    const versionAndTabSlug = [];
    if (basePath != null) {
        for (const part of basePath.split("/")) {
            if (part.trim().length === 0) {
                continue;
            }
            if (currentPath[0] === part) {
                currentPath = currentPath.slice(1);
                versionAndTabSlug.push(part);
            } else {
                return undefined;
            }
        }
    }

    if (isVersionedNavigationConfig(nav)) {
        const matchedVersion = nav.versions.find((version) => version.urlSlug === currentPath[0]) ?? nav.versions[0];

        if (matchedVersion == null) {
            return undefined;
        }

        versionAndTabSlug.push(matchedVersion.urlSlug);

        if (isUnversionedTabbedNavigationConfig(matchedVersion.config)) {
            const matchedTab =
                matchedVersion.config.tabs.find((tab) => tab.urlSlug === currentPath[1]) ??
                matchedVersion.config.tabs[0];

            if (matchedTab == null) {
                return undefined;
            }

            versionAndTabSlug.push(matchedVersion.urlSlug, matchedTab.urlSlug);
        }
    } else if (isUnversionedTabbedNavigationConfig(nav)) {
        const matchedTab = nav.tabs.find((tab) => tab.urlSlug === currentPath[0]) ?? nav.tabs[0];

        if (matchedTab == null) {
            return undefined;
        }

        versionAndTabSlug.push(matchedTab.urlSlug);
    }
    return versionAndTabSlug;
}

export async function getNavigation(
    slugArray: string[],
    basePath: string | undefined,
    apis: Record<FdrAPI.ApiId, APIV1Read.ApiDefinition>,
    nav: DocsV1Read.NavigationConfig,
): Promise<SidebarNavigation | undefined> {
    let currentPath = slugArray;

    let currentVersionIndex: number | undefined;
    let versions: SidebarVersionInfo[] = [];
    let currentTabIndex: number | undefined;
    let tabs: SidebarTab[] = [];
    const slug: string[] = [];

    if (basePath != null) {
        basePath.split("/").forEach((part) => {
            part = part.trim();
            if (part.length === 0) {
                return;
            }
            if (currentPath[0] === part) {
                currentPath = currentPath.slice(1);
            }
            slug.push(part);
        });
    }

    if (isVersionedNavigationConfig(nav)) {
        currentVersionIndex = nav.versions.findIndex((version) => version.urlSlug === currentPath[0]);

        versions = nav.versions.map((version, idx) => ({
            id: version.version,
            slug: idx === 0 && currentVersionIndex === -1 ? [...slug] : [...slug, version.urlSlug],
            index: idx,
            availability: version.availability ?? null,
        }));

        // If the version slug is not found based on the current path, default to the first version
        // otherwise, remove the version slug from the current path
        if (currentVersionIndex > -1) {
            currentPath = currentPath.slice(1);
        }

        const matchedVersion = nav.versions[currentVersionIndex > -1 ? currentVersionIndex : 0];

        if (matchedVersion == null) {
            return undefined;
        }

        if (currentVersionIndex > -1) {
            slug.push(matchedVersion.urlSlug);
        } else {
            currentVersionIndex = 0;
        }

        nav = matchedVersion.config;
    }

    let currentNavigationItems: DocsV1Read.NavigationItem[] = [];

    if (isUnversionedTabbedNavigationConfig(nav)) {
        tabs = nav.tabs.map((tab) => ({
            title: tab.title,
            icon: tab.icon,
            slug: [...slug, tab.urlSlug],
        }));

        currentTabIndex = currentPath.length === 0 ? 0 : nav.tabs.findIndex((tab) => tab.urlSlug === currentPath[0]);

        const matchedTab = nav.tabs[currentTabIndex];

        if (matchedTab == null) {
            return undefined;
        }

        slug.push(matchedTab.urlSlug);

        currentNavigationItems = matchedTab.items;
    }

    if (isUnversionedUntabbedNavigationConfig(nav)) {
        currentNavigationItems = nav.items;
    }

    const sidebarNodes = await resolveSidebarNodes(currentNavigationItems, apis, slug);

    return {
        currentTabIndex,
        tabs,
        currentVersionIndex,
        versions,
        sidebarNodes,
        slug,
    };
}
