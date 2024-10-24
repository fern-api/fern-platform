import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { withDefaultProtocol } from "@fern-api/ui-core-utils";
import visitDiscriminatedUnion from "@fern-api/ui-core-utils/visitDiscriminatedUnion";
import { SidebarTab } from "@fern-ui/fdr-utils";
import {
    getAuthEdgeConfig,
    getCustomerAnalytics,
    getFeatureFlags,
    getSeoDisabled,
} from "@fern-ui/fern-docs-edge-config";
import { getRedirectForPath } from "@fern-ui/fern-docs-utils";
import {
    DocsPage,
    getApiRouteSupplier,
    getGitHubInfo,
    getGitHubRepo,
    getSeoProps,
    renderThemeStylesheet,
    resolveDocsContent,
} from "@fern-ui/ui";
import { getMdxBundler } from "@fern-ui/ui/bundlers";
import { GetServerSidePropsResult } from "next";
import { ComponentProps } from "react";
import urlJoin from "url-join";
import { DocsLoader } from "./DocsLoader";
import type { AuthState } from "./auth/getAuthState";
import { handleLoadDocsError } from "./handleLoadDocsError";
import type { LoadWithUrlResponse } from "./loadWithUrl";
import { isTrailingSlashEnabled } from "./trailingSlash";
import { pruneNavigationPredicate, withPrunedSidebar } from "./withPrunedSidebar";
import { withVersionSwitcherInfo } from "./withVersionSwitcherInfo";

interface WithInitialProps {
    docs: LoadWithUrlResponse;
    slug: FernNavigation.Slug;
    /**
     * Docs domain
     */
    domain: string;
    /**
     * Hostname of this request (i.e. localhost, or preview URL, otherwise the docs domain in production)
     */
    host: string;
    auth?: AuthState;
}

export async function withInitialProps({
    docs: docsResponse,
    slug,
    domain,
    host,
    auth,
}: WithInitialProps): Promise<GetServerSidePropsResult<ComponentProps<typeof DocsPage>>> {
    if (!docsResponse.ok) {
        return handleLoadDocsError(domain, slug, docsResponse.error);
    }

    const docs = docsResponse.body;
    const docsDefinition = docs.definition;
    const docsConfig = docsDefinition.config;

    const redirect = getRedirectForPath(urlJoin("/", slug), docs.baseUrl, docsConfig.redirects);

    if (redirect != null) {
        return redirect;
    }

    const featureFlags = await getFeatureFlags(domain);

    const authConfig = await getAuthEdgeConfig(domain);
    const loader = DocsLoader.for(domain)
        .withFeatureFlags(featureFlags)
        .withAuth(authConfig, auth)
        .withLoadDocsForUrlResponse(docs);

    const root = await loader.root();

    // this should not happen, but if it does, we should return a 404
    if (root == null) {
        return { notFound: true };
    }

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
        // this is a special case where the user is not authenticated, and the page requires authentication,
        // but the user is trying to access a page that is not found. in this case, we should redirect to the auth page.
        if (authConfig?.type === "basic_token_verification" && auth == null) {
            const original = await loader.unprunedRoot();
            if (original) {
                const node = FernNavigation.utils.findNode(original, slug);
                if (node.type !== "notFound") {
                    return { redirect: { destination: authConfig.redirect, permanent: false } };
                }
            }
        }

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

    const engine = featureFlags.useMdxBundler ? "mdx-bundler" : "next-mdx-remote";
    const serializeMdx = await getMdxBundler(engine);

    const content = await resolveDocsContent({
        found: node,
        apis: docs.definition.apis,
        pages: docs.definition.pages,
        featureFlags,
        mdxOptions: {
            files: docs.definition.jsFiles,
        },
        serializeMdx,
        host: docs.baseUrl.domain,
        engine,
    });

    if (content == null) {
        return { notFound: true };
    }

    const getApiRoute = getApiRouteSupplier({
        basepath: docs.baseUrl.basePath,
        includeTrailingSlash: isTrailingSlashEnabled(),
    });

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

    const logoHref =
        docs.definition.config.logoHref ??
        (node.landingPage?.slug != null && !node.landingPage.hidden ? `/${node.landingPage.slug}` : undefined);

    const navbarLinks = docs.definition.config.navbarLinks ?? [];

    // TODO: This is a hack to add a login/logout button to the navbar. This should be done in a more generic way.
    if (authConfig?.type === "basic_token_verification") {
        if (auth == null) {
            const redirect = new URL(withDefaultProtocol(authConfig.redirect));
            redirect.searchParams.set("state", urlJoin(withDefaultProtocol(host), slug));

            navbarLinks.push({
                type: "outlined",
                text: "Login",
                url: FernNavigation.Url(redirect.toString()),
                icon: undefined,
                rightIcon: undefined,
                rounded: false,
            });
        } else {
            const logout = new URL(getApiRoute("/api/fern-docs/auth/logout"), withDefaultProtocol(host));
            logout.searchParams.set("state", urlJoin(withDefaultProtocol(host), slug));

            navbarLinks.push({
                type: "outlined",
                text: "Logout",
                url: FernNavigation.Url(logout.toString()),
                icon: undefined,
                rightIcon: undefined,
                rounded: false,
            });
        }
    }

    const pruneOpts = {
        node: node.node,
        isAuthenticated: auth != null,
        isAuthenticatedPagesDiscoverable: featureFlags.isAuthenticatedPagesDiscoverable,
    };

    const currentVersionId = node.currentVersion?.versionId;
    const versions = withVersionSwitcherInfo({
        node: node.node,
        parents: node.parents,
        versions: node.versions.filter(
            (version) => pruneNavigationPredicate(version, pruneOpts) || version.versionId === currentVersionId,
        ),
        slugMap: node.collector.slugMap,
    });

    const sidebar = withPrunedSidebar(node.sidebar, pruneOpts);

    const filteredTabs = node.tabs.filter((tab) => pruneNavigationPredicate(tab, pruneOpts) || tab === node.currentTab);

    const tabs = filteredTabs.map((tab, index) =>
        visitDiscriminatedUnion(tab)._visit<SidebarTab>({
            tab: (tab) => ({
                type: "tabGroup",
                title: tab.title,
                icon: tab.icon,
                index,
                slug: tab.slug,
                pointsTo: tab.pointsTo,
                hidden: tab.hidden,
                authed: tab.authed,
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
                hidden: changelog.hidden,
                authed: changelog.authed,
            }),
        }),
    );

    const currentTabIndex = node.currentTab == null ? undefined : filteredTabs.indexOf(node.currentTab);

    const props: ComponentProps<typeof DocsPage> = {
        baseUrl: docs.baseUrl,
        layout: docs.definition.config.layout,
        title: docs.definition.config.title,
        favicon: docs.definition.config.favicon,
        colors,
        js: docs.definition.config.js,
        navbarLinks,
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
            currentTabIndex,
            tabs,
            currentVersionId,
            versions,
            sidebar,
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
            await getSeoDisabled(domain),
            isTrailingSlashEnabled(),
        ),
        user: auth?.authed ? auth.user : undefined,
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

    return {
        props: JSON.parse(JSON.stringify(props)), // remove all undefineds
    };
}
