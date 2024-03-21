import { APIV1Read, DocsV1Read, DocsV2Read, FdrAPI } from "@fern-api/fdr-sdk";
import { visitDiscriminatedUnion } from "@fern-ui/core-utils";
import { Redirect } from "next";
import Head from "next/head";
import Script from "next/script";
import { ReactElement, useMemo } from "react";
import { useDocsContext } from "../contexts/docs-context/useDocsContext";
import { FeatureFlags } from "../contexts/FeatureFlagContext";
import { resolveSidebarNodes } from "../sidebar/resolver";
import { serializeSidebarNodeDescriptionMdx } from "../sidebar/serializer";
import type { ColorsConfig, SidebarNavigation, SidebarTab, SidebarVersionInfo } from "../sidebar/types";
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
        // backgroundImage: string | undefined;
        colors: ColorsConfig;
        layout: DocsV1Read.DocsLayoutConfig | undefined;
        typography: DocsV1Read.DocsTypographyConfigV2 | undefined;
        css: DocsV1Read.CssConfig | undefined;
        js: DocsV1Read.JsConfig | undefined;
        navbarLinks: DocsV1Read.NavbarLink[];
        logoHeight: DocsV1Read.Height | undefined;
        logoHref: DocsV1Read.Url | undefined;

        search: DocsV1Read.SearchInfo;
        algoliaSearchIndex: DocsV1Read.AlgoliaSearchIndex | undefined;
        files: Record<DocsV1Read.FileId, DocsV1Read.File_>;
        resolvedPath: ResolvedPath;

        featureFlags: FeatureFlags;
    }
}

export function DocsPage({
    title,
    favicon,
    js,
    navbarLinks,
    logoHeight,
    logoHref,
    search,
    algoliaSearchIndex,
}: DocsPage.Props): ReactElement {
    const { colors, typography, layout, css, files } = useDocsContext();
    const stylesheet = useMemo(
        () => renderThemeStylesheet(colors, typography, layout, css, files),
        [colors, css, files, layout, typography],
    );
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
                logoHeight={logoHeight}
                logoHref={logoHref}
                navbarLinks={navbarLinks}
                search={search}
                algoliaSearchIndex={algoliaSearchIndex}
            />
            {js?.inline?.map((inline, idx) => (
                <Script key={`inline-script-${idx}`} id={`inline-script-${idx}`}>
                    {inline}
                </Script>
            ))}
            {js?.files.map((file) => (
                <Script
                    key={file.fileId}
                    src={files[file.fileId]?.url}
                    strategy={file.strategy}
                    type="module"
                    crossOrigin="anonymous"
                />
            ))}
            {js?.remote?.map((remote) => <Script key={remote.url} src={remote.url} strategy={remote.strategy} />)}
        </>
    );
}

export type DocsPageResult<Props> =
    | { type: "props"; props: Props; revalidate?: number | boolean }
    | { type: "redirect"; redirect: Redirect; revalidate?: number | boolean }
    | { type: "notFound"; notFound: true; revalidate?: number | boolean };

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
        currentVersionIndex = nav.versions.findIndex((version) => {
            const versionSlug = version.urlSlug.split("/");
            if (versionSlug.length > currentPath.length) {
                return false;
            }
            for (let i = 0; i < versionSlug.length; i++) {
                if (versionSlug[i] !== currentPath[i]) {
                    return false;
                }
            }
            return true;
        });

        versions = nav.versions.map((version, idx) => ({
            id: version.version,
            slug: idx === 0 && currentVersionIndex === -1 ? [...slug] : [...slug, ...version.urlSlug.split("/")],
            index: idx,
            availability: version.availability ?? null,
        }));

        // If the version slug is not found based on the current path, default to the first version
        // otherwise, remove the version slug from the current path
        if (currentVersionIndex > -1) {
            currentPath = currentPath.slice(nav.versions[currentVersionIndex]?.urlSlug.split("/").length);
        }

        const matchedVersion = nav.versions[currentVersionIndex > -1 ? currentVersionIndex : 0];

        if (matchedVersion == null) {
            return undefined;
        }

        if (currentVersionIndex > -1) {
            slug.push(...matchedVersion.urlSlug.split("/"));
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
            slug: [...slug, ...tab.urlSlug.split("/")],
        }));

        currentTabIndex =
            currentPath.length === 0
                ? 0
                : nav.tabs.findIndex((tab) => {
                      const tabSlug = tab.urlSlug.split("/");
                      if (tabSlug.length > currentPath.length) {
                          return false;
                      }
                      for (let i = 0; i < tabSlug.length; i++) {
                          if (tabSlug[i] !== currentPath[i]) {
                              return false;
                          }
                      }
                      return true;
                  });

        const matchedTab = nav.tabs[currentTabIndex];

        if (matchedTab == null) {
            for (let i = 0; i < nav.tabs.length; i++) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                const currentTab = nav.tabs[i]!;

                if (containsMatchingFullSlug(currentTab.items, slugArray.join("/"))) {
                    const rawSidebarNodes = resolveSidebarNodes(currentTab.items, apis, [
                        ...slug,
                        ...currentTab.urlSlug.split("/"),
                    ]);
                    const sidebarNodes = await Promise.all(
                        rawSidebarNodes.map((node) => serializeSidebarNodeDescriptionMdx(node)),
                    );

                    return {
                        currentTabIndex: i,
                        tabs,
                        currentVersionIndex,
                        versions,
                        sidebarNodes,
                        slug,
                    };
                }
            }
            return undefined;
        }

        slug.push(...matchedTab.urlSlug.split("/"));

        currentNavigationItems = matchedTab.items;
    }

    if (isUnversionedUntabbedNavigationConfig(nav)) {
        currentNavigationItems = nav.items;
    }

    const rawSidebarNodes = resolveSidebarNodes(currentNavigationItems, apis, slug);
    const sidebarNodes = await Promise.all(rawSidebarNodes.map((node) => serializeSidebarNodeDescriptionMdx(node)));

    return {
        currentTabIndex,
        tabs,
        currentVersionIndex,
        versions,
        sidebarNodes,
        slug,
    };
}

function containsMatchingFullSlug(items: DocsV1Read.NavigationItem[], fullSlug: string): boolean {
    return items.some((item) =>
        visitDiscriminatedUnion(item, "type")._visit({
            page: (page) => page.fullSlug != null && page.fullSlug.join("/") === fullSlug,
            api: (api) => api.fullSlug != null && api.fullSlug.join("/") === fullSlug,
            section: (section) =>
                // first check if any of the items in the section match the full slug
                containsMatchingFullSlug(section.items, fullSlug) ||
                // then check if the section itself matches the full slug
                (section.fullSlug != null && section.fullSlug.join("/") === fullSlug),
            link: () => false,
            _other: () => false,
        }),
    );
}
