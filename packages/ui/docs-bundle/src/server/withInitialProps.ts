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
} from "@fern-ui/ui";
import { getMdxBundler } from "@fern-ui/ui/bundlers";
import { GetServerSidePropsResult, Redirect } from "next";
import { ComponentProps } from "react";
import urlJoin from "url-join";
import { DocsLoader } from "./DocsLoader";
import { addLeadingSlash } from "./addLeadingSlash";
import { getAuthState } from "./auth/getAuthState";
import { handleLoadDocsError } from "./handleLoadDocsError";
import type { LoadWithUrlResponse } from "./loadWithUrl";
import { isTrailingSlashEnabled } from "./trailingSlash";
import { pruneNavigationPredicate, withPrunedNavigation } from "./withPrunedNavigation";
import { withResolvedDocsContent } from "./withResolvedDocsContent";
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
    fern_token: string | undefined;
}

export async function withInitialProps({
    docs: docsResponse,
    slug,
    domain,
    host,
    fern_token,
}: WithInitialProps): Promise<GetServerSidePropsResult<ComponentProps<typeof DocsPage>>> {
    if (!docsResponse.ok) {
        return handleLoadDocsError(domain, slug, docsResponse.error);
    }

    const docs = docsResponse.body;

    // check for redirects
    const redirect = getRedirectForPath(addLeadingSlash(slug), docs.baseUrl, docs.definition.config.redirects);
    if (redirect != null) {
        return redirect;
    }

    // load from edge config
    const [featureFlags, authConfig] = await Promise.all([getFeatureFlags(domain), getAuthEdgeConfig(domain)]);
    const authState = await getAuthState(domain, host, fern_token, addLeadingSlash(slug), authConfig);

    // create loader (this will load all nodes)
    const loader = DocsLoader.for(domain, host)
        .withFeatureFlags(featureFlags)
        .withAuth(authConfig, authState)
        .withLoadDocsForUrlResponse(docs);

    // get the root node
    const root = await loader.root();

    // this should not happen, but if it does, we should return a 404
    if (root == null) {
        // TODO: sentry
        // eslint-disable-next-line no-console
        console.error("Root node not found");
        return { notFound: true };
    }

    // if the root has a slug and the current slug is empty, redirect to the root slug, rather than 404
    if (root.slug.length > 0 && slug.length === 0) {
        return withRedirect(root.slug);
    }

    // find the node that is currently being viewed
    const found = FernNavigation.utils.findNode(root, slug);

    if (found.type === "notFound") {
        // TODO: returning "notFound: true" here will render vercel's default 404 page
        // this is better than following redirects, since it will signal a proper 404 status code.
        // however, we should consider rendering a custom 404 page in the future using the customer's branding.
        // see: https://nextjs.org/docs/app/api-reference/file-conventions/not-found

        if (featureFlags.is404PageHidden && found.redirect != null) {
            return withRedirect(found.redirect);
        }

        return { notFound: true };
    }

    if (found.type === "redirect") {
        return withRedirect(found.redirect);
    }

    // if the current node requires authentication and the user is not authenticated, redirect to the auth page
    if (found.node.authed && !authState.authed) {
        // TODO: there's currently no way to express a 401 or 403 in Next.js so we'll redirect to 404.
        // ideally this is handled in the middleware, and this should be a 500 error.
        if (authState.authorizationUrl == null) {
            return { notFound: true };
        }
        return withRedirect(authState.authorizationUrl);
    }

    const content = await withResolvedDocsContent({
        domain: docs.baseUrl.domain,
        found,
        authState,
        definition: docs.definition,
        featureFlags,
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
        (found.landingPage?.slug != null && !found.landingPage.hidden
            ? encodeURI(addLeadingSlash(found.landingPage.slug))
            : undefined);

    const navbarLinks = docs.definition.config.navbarLinks ?? [];

    // TODO: This is a hack to add a login/logout button to the navbar. This should be done in a more generic way.
    if (authConfig?.type === "basic_token_verification") {
        if (!authState.authed) {
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
        visibleNodeIds: [found.node.id],
        authed: authState.authed,
        // when true, all unauthed pages are visible, but rendered with a LOCK button
        // so they're not actually "pruned" from the sidebar
        // TODO: move this out of a feature flag and into the navigation node metadata
        discoverable: featureFlags.isAuthenticatedPagesDiscoverable ? (true as const) : undefined,
    };

    const currentVersionId = found.currentVersion?.versionId;
    const versions = withVersionSwitcherInfo({
        node: found.node,
        parents: found.parents,
        versions: found.versions.filter(
            (version) => pruneNavigationPredicate(version, pruneOpts) || version.versionId === currentVersionId,
        ),
        slugMap: found.collector.slugMap,
    });

    const sidebar = withPrunedNavigation(found.sidebar, pruneOpts);

    const filteredTabs = found.tabs.filter(
        (tab) => pruneNavigationPredicate(tab, pruneOpts) || tab === found.currentTab,
    );

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

    const currentTabIndex = found.currentTab == null ? undefined : filteredTabs.indexOf(found.currentTab);

    const engine = featureFlags.useMdxBundler ? "mdx-bundler" : "next-mdx-remote";
    const serializeMdx = await getMdxBundler(engine);

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
            found,
            await getSeoDisabled(domain),
            isTrailingSlashEnabled(),
        ),
        user: authState.authed ? authState.user : undefined,
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
            found.tabs.length > 0,
        ),
    };

    // if the user specifies a github navbar link, grab the repo info from it and save it as an SWR fallback
    const githubNavbarLink = docs.definition.config.navbarLinks?.find((link) => link.type === "github");
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

function withRedirect(destination: string): { redirect: Redirect } {
    if (destination.startsWith("http://") || destination.startsWith("https://")) {
        const url = new URL(destination);
        destination = url.toString();
    } else {
        destination = encodeURI(addLeadingSlash(destination));
    }
    return { redirect: { destination, permanent: false } };
}
