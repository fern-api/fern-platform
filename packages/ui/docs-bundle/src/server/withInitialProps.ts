import { getFeatureFlags } from "@/pages/api/fern-docs/feature-flags";
import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import visitDiscriminatedUnion from "@fern-ui/core-utils/visitDiscriminatedUnion";
import { SidebarTab } from "@fern-ui/fdr-utils";
import { getRedirectForPath } from "@fern-ui/fern-docs-utils";
import { getSearchConfig } from "@fern-ui/search-utils";
import {
    DocsPage,
    getApiRouteSupplier,
    getGitHubInfo,
    getGitHubRepo,
    getSeoProps,
    provideRegistryService,
    renderThemeStylesheet,
    resolveDocsContent,
} from "@fern-ui/ui";
import { getAPIKeyInjectionConfigNode } from "@fern-ui/ui/auth";
import { getMdxBundler } from "@fern-ui/ui/bundlers";
import { GetServerSidePropsResult } from "next";
import { ComponentProps } from "react";
import urlJoin from "url-join";
import type { AuthProps } from "./authProps";
import { getSeoDisabled } from "./disabledSeo";
import { getCustomerAnalytics } from "./getCustomerAnalytics";
import { handleLoadDocsError } from "./handleLoadDocsError";
import type { LoadWithUrlResponse } from "./loadWithUrl";
import { isTrailingSlashEnabled } from "./trailingSlash";
import { withVersionSwitcherInfo } from "./withVersionSwitcherInfo";

interface WithInitialProps {
    docs: LoadWithUrlResponse;
    slug: string[];
    xFernHost: string;
    auth?: AuthProps;
}

export async function withInitialProps({
    docs: docsResponse,
    slug: slugArray,
    xFernHost,
    auth,
}: WithInitialProps): Promise<GetServerSidePropsResult<ComponentProps<typeof DocsPage>>> {
    if (!docsResponse.ok) {
        return handleLoadDocsError(xFernHost, slugArray, docsResponse.error);
    }

    const docs = docsResponse.body;
    const docsDefinition = docs.definition;
    const docsConfig = docsDefinition.config;

    const slug = FernNavigation.slugjoin(...slugArray);

    const redirect = getRedirectForPath(urlJoin("/", slug), docs.baseUrl, docsConfig.redirects);

    if (redirect != null) {
        return redirect;
    }

    const featureFlags = await getFeatureFlags(xFernHost);
    const root = FernNavigation.utils.toRootNode(
        docs,
        featureFlags.isBatchStreamToggleDisabled,
        featureFlags.isApiScrollingDisabled,
    );

    // if the root has a slug and the current slug is empty, redirect to the root slug, rather than 404
    if (root.slug.length > 0 && slug.length === 0) {
        return {
            redirect: {
                destination: encodeURI(urlJoin("/", root.slug)),
                permanent: false,
            },
        };
    }

    const node = FernNavigation.utils.findNode(root, slug);

    if (node.type === "notFound") {
        // TODO: returning "notFound: true" here will render vercel's default 404 page
        // this is better than following redirects, since it will signal a proper 404 status code.
        // however, we should consider rendering a custom 404 page in the future using the customer's branding.
        // see: https://nextjs.org/docs/app/api-reference/file-conventions/not-found

        if (featureFlags.is404PageHidden && node.redirect != null) {
            return {
                // urlJoin is bizarre: urlJoin("/", "") === "", urlJoin("/", "/") === "/", urlJoin("/", "/a") === "/a"
                // "" || "/" === "/"
                redirect: {
                    destination: encodeURI(urlJoin("/", node.redirect) || "/"),
                    permanent: false,
                },
            };
        }

        return { notFound: true };
    }

    if (node.type === "redirect") {
        return {
            redirect: {
                destination: encodeURI(urlJoin("/", node.redirect)),
                permanent: false,
            },
        };
    }

    const serializeMdx = await getMdxBundler(featureFlags.useMdxBundler ? "mdx-bundler" : "next-mdx-remote");

    const content = await resolveDocsContent({
        found: node,
        apis: docs.definition.apis,
        pages: docs.definition.pages,
        featureFlags,
        mdxOptions: {
            files: docs.definition.jsFiles,
        },
        serializeMdx,
    });

    if (content == null) {
        return { notFound: true };
    }

    const colors = {
        light:
            docs.definition.config.colorsV3?.type === "light"
                ? docs.definition.config.colorsV3
                : docs.definition.config.colorsV3?.type === "darkAndLight"
                  ? docs.definition.config.colorsV3.light
                  : undefined,
        dark:
            docs.definition.config.colorsV3?.type === "dark"
                ? docs.definition.config.colorsV3
                : docs.definition.config.colorsV3?.type === "darkAndLight"
                  ? docs.definition.config.colorsV3.dark
                  : undefined,
    };

    const versions = withVersionSwitcherInfo({
        node: node.node,
        parents: node.parents,
        versions: node.versions,
        slugMap: node.collector.slugMap,
    });

    const logoHref =
        docs.definition.config.logoHref ??
        (node.landingPage?.slug != null && !node.landingPage.hidden ? `/${node.landingPage.slug}` : undefined);

    const props: ComponentProps<typeof DocsPage> = {
        baseUrl: docs.baseUrl,
        layout: docs.definition.config.layout,
        title: docs.definition.config.title,
        favicon: docs.definition.config.favicon,
        colors,
        js: docs.definition.config.js,
        navbarLinks: docs.definition.config.navbarLinks ?? [],
        logoHeight: docs.definition.config.logoHeight,
        logoHref: logoHref != null ? FernNavigation.Url(logoHref) : undefined,
        files: docs.definition.filesV2,
        content,
        announcement:
            docs.definition.config.announcement != null
                ? {
                      mdx: await serializeMdx(docs.definition.config.announcement.text),
                      text: docs.definition.config.announcement.text,
                  }
                : undefined,
        navigation: {
            currentTabIndex: node.currentTab == null ? undefined : node.tabs.indexOf(node.currentTab),
            tabs: node.tabs.map((tab, index) =>
                visitDiscriminatedUnion(tab)._visit<SidebarTab>({
                    tab: (tab) => ({
                        type: "tabGroup",
                        title: tab.title,
                        icon: tab.icon,
                        index,
                        slug: tab.slug,
                        pointsTo: tab.pointsTo,
                    }),
                    link: (link) => ({
                        type: "tabLink",
                        title: link.title,
                        icon: link.icon,
                        index,
                        url: link.url,
                    }),
                    changelog: (changelog) => ({
                        type: "tabChangelog",
                        title: changelog.title,
                        icon: changelog.icon,
                        index,
                        slug: changelog.slug,
                    }),
                }),
            ),
            currentVersionId: node.currentVersion?.versionId,
            versions,
            sidebar: node.sidebar,
            trailingSlash: isTrailingSlashEnabled(),
        },
        featureFlags,
        apis: Object.keys(docs.definition.apis).map(FernNavigation.ApiDefinitionId),
        seo: getSeoProps(
            docs.baseUrl.domain,
            docs.definition.config,
            docs.definition.pages,
            docs.definition.filesV2,
            docs.definition.apis,
            node,
            await getSeoDisabled(xFernHost),
            isTrailingSlashEnabled(),
        ),
        user: auth?.user,
        fallback: {},
        // eslint-disable-next-line deprecation/deprecation
        analytics: await getCustomerAnalytics(docs.baseUrl.domain, docs.baseUrl.basePath),
        theme: featureFlags.isCohereTheme ? "cohere" : "default",
        analyticsConfig: docs.definition.config.analyticsConfig,
        defaultLang: docs.definition.config.defaultLanguage ?? "curl",
        stylesheet: renderThemeStylesheet(
            colors,
            docs.definition.config.typographyV2,
            docs.definition.config.layout,
            docs.definition.config.css,
            docs.definition.filesV2,
            node.tabs.length > 0,
        ),
    };

    const getApiRoute = getApiRouteSupplier({
        basepath: docs.baseUrl.basePath,
        includeTrailingSlash: isTrailingSlashEnabled(),
    });

    props.fallback[getApiRoute("/api/fern-docs/search")] = await getSearchConfig(
        provideRegistryService(),
        xFernHost,
        docs.definition.search,
    );

    // if the user specifies a github navbar link, grab the repo info from it and save it as an SWR fallback
    const githubNavbarLink = docsConfig.navbarLinks?.find((link) => link.type === "github");
    if (githubNavbarLink) {
        const repo = getGitHubRepo(githubNavbarLink.url);
        if (repo) {
            const data = await getGitHubInfo(repo);
            if (data) {
                props.fallback[repo] = data;
            }
        }
    }

    const apiKeyInjectionConfig = await getAPIKeyInjectionConfigNode(xFernHost, auth?.cookies);
    props.fallback[getApiRoute("/api/fern-docs/auth/api-key-injection")] = apiKeyInjectionConfig;

    return {
        props: JSON.parse(JSON.stringify(props)), // remove all undefineds
    };
}
