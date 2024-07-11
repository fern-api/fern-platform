import { FdrClient, FernNavigation, type DocsV2Read } from "@fern-api/fdr-sdk";
import { FernVenusApi, FernVenusApiClient } from "@fern-api/venus-api-sdk";
import { visitDiscriminatedUnion } from "@fern-ui/core-utils";
import { SidebarTab, buildUrl } from "@fern-ui/fdr-utils";
import {
    DocsPage,
    DocsPageResult,
    convertNavigatableToResolvedPath,
    getBreadcrumbList,
    getDefaultSeoProps,
    getGitHubInfo,
    getGitHubRepo,
    setMdxBundler,
} from "@fern-ui/ui";
// eslint-disable-next-line import/no-internal-modules
import { FernUser, getOAuthEdgeConfig, verifyFernJWT } from "@fern-ui/ui/auth";
// eslint-disable-next-line import/no-internal-modules
import { getMdxBundler } from "@fern-ui/ui/bundlers";
import type { Redirect } from "next";
import { NextApiRequestCookies } from "next/dist/server/api-utils";
import { type IncomingMessage, type ServerResponse } from "node:http";
import { default as urlJoin, default as urljoin } from "url-join";
import { getFeatureFlags } from "../pages/api/fern-docs/feature-flags";
import { getCustomerAnalytics } from "./analytics";
import { getAuthorizationUrl } from "./auth";
import { getRedirectForPath } from "./hackRedirects";

async function getUnauthenticatedRedirect(xFernHost: string, path: string): Promise<Redirect> {
    const authorizationUrl = getAuthorizationUrl(
        {
            organization: await maybeGetWorkosOrganization(xFernHost),
            state: encodeURIComponent(urlJoin(`https://${xFernHost}`, path)),
        },
        xFernHost,
    );
    return { destination: authorizationUrl, permanent: false };
}

const REGISTRY_SERVICE = new FdrClient({
    environment: process.env.NEXT_PUBLIC_FDR_ORIGIN ?? "https://registry.buildwithfern.com",
});

function getRegistryServiceWithToken(token: string): FdrClient {
    return new FdrClient({
        environment: process.env.NEXT_PUBLIC_FDR_ORIGIN ?? "https://registry.buildwithfern.com",
        token,
    });
}

export interface User {
    isAuthenticated: boolean;
    user?: FernUser;
}

export async function getDocsPageProps(
    xFernHost: string | undefined,
    slug: string[],
): Promise<DocsPageResult<DocsPage.Props>> {
    if (xFernHost == null || Array.isArray(xFernHost)) {
        return { type: "notFound", notFound: true };
    }

    const pathname = decodeURI(slug != null ? slug.join("/") : "");
    const url = buildUrl({ host: xFernHost, pathname });
    // eslint-disable-next-line no-console
    console.log("[getDocsPageProps] Loading docs for", url);
    const start = Date.now();
    const docs = await REGISTRY_SERVICE.docs.v2.read.getDocsForUrl({ url });
    const end = Date.now();
    // eslint-disable-next-line no-console
    console.log(`[getDocsPageProps] Fetch completed in ${end - start}ms for ${url}`);
    if (!docs.ok) {
        if ((docs.error as any).content.statusCode === 401) {
            return {
                type: "redirect",
                redirect: await getUnauthenticatedRedirect(xFernHost, `/${slug.join("/")}`),
            };
        } else if ((docs.error as any).content.statusCode === 404) {
            return { type: "notFound", notFound: true };
        }

        // eslint-disable-next-line no-console
        console.error(`[getDocsPageProps] Failed to fetch docs for ${url}`, docs.error);
        throw new Error("Failed to fetch docs");
    }

    const start2 = Date.now();
    const toRet = convertDocsToDocsPageProps({ docs: docs.body, slug, url, xFernHost });
    const end2 = Date.now();

    // eslint-disable-next-line no-console
    console.log(`[getDocsPageProps] serializeMdx completed in ${end2 - start2}ms for ${url}`);
    return toRet;
}

export async function getDynamicDocsPageProps(
    xFernHost: string,
    slug: string[],
    cookies: NextApiRequestCookies,
    res: ServerResponse<IncomingMessage>,
): Promise<DocsPageResult<DocsPage.Props>> {
    const url = buildUrl({ host: xFernHost, pathname: slug.join("/") });
    if (cookies.fern_token == null) {
        return getDocsPageProps(xFernHost, slug);
    }

    try {
        const user = await verifyFernJWT(cookies.fern_token);

        if (user.partner === "workos") {
            const registryService = getRegistryServiceWithToken(`workos_${cookies.fern_token}`);

            // eslint-disable-next-line no-console
            console.log("[getDynamicDocsPageProps] Loading docs for", url);
            const start = Date.now();
            const docs = await registryService.docs.v2.read.getPrivateDocsForUrl({ url });
            const end = Date.now();
            // eslint-disable-next-line no-console
            console.log(`[getDynamicDocsPageProps] Fetch completed in ${end - start}ms for ${url}`);

            if (!docs.ok) {
                res.setHeader("Set-Cookie", "fern_token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0");

                if (docs.error.error === "UnauthorizedError") {
                    return {
                        type: "redirect",
                        redirect: await getUnauthenticatedRedirect(xFernHost, `/${slug.join("/")}`),
                    };
                }

                // eslint-disable-next-line no-console
                console.error(`[getDynamicDocsPageProps] Failed to fetch docs for ${url}`, docs.error);
                throw new Error("Failed to fetch private docs");
            }

            return convertDocsToDocsPageProps({ docs: docs.body, slug, url, xFernHost });
        } else if (user.partner === "ory") {
            const docs = await REGISTRY_SERVICE.docs.v2.read.getDocsForUrl({ url });

            if (!docs.ok) {
                throw new Error("Failed to fetch docs");
            }

            const config = await getOAuthEdgeConfig(xFernHost);

            if (config == null) {
                throw new Error("Failed to fetch OAuth config");
            }

            return convertDocsToDocsPageProps({
                docs: docs.body,
                slug,
                url,
                xFernHost,
                user,
                apiKey: config["api-key-injection-enabled"] ? cookies.access_token : undefined,
            });
        }
    } catch (error) {
        // eslint-disable-next-line no-console
        console.log(error);
    }

    // Clear the token if it's invalid, then redirect to `/` to reset the login flow
    res.setHeader("Set-Cookie", "fern_token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0");
    return {
        type: "redirect",
        redirect: {
            destination: `/${slug.join("/")}`,
            permanent: false,
        },
    };
}

async function convertDocsToDocsPageProps({
    docs,
    slug,
    url,
    xFernHost,
    user,
    apiKey,
}: {
    docs: DocsV2Read.LoadDocsForUrlResponse;
    slug: string[];
    url: string;
    xFernHost: string;
    user?: FernUser;
    apiKey?: string;
}): Promise<DocsPageResult<DocsPage.Props>> {
    const docsDefinition = docs.definition;
    const docsConfig = docsDefinition.config;

    const currentPath = urljoin("/", slug.join("/"));

    const redirect = getRedirectForPath(currentPath, docs.baseUrl, docsConfig.redirects);

    if (redirect != null) {
        return {
            type: "redirect",
            redirect: {
                destination: redirect.destination,
                permanent: false,
            },
        };
    }

    const root = FernNavigation.utils.convertLoadDocsForUrlResponse(docs);
    const node = FernNavigation.utils.findNode(root, slug);

    if (node.type === "notFound") {
        // eslint-disable-next-line no-console
        console.error(`Failed to resolve navigation for ${url}`);
        if (node.redirect != null) {
            return {
                type: "redirect",
                redirect: {
                    destination: encodeURI(urljoin("/", node.redirect)),
                    permanent: false,
                },
            };
        }
        return { type: "notFound", notFound: true };
    }

    if (node.type === "redirect") {
        return {
            type: "redirect",
            redirect: {
                destination: encodeURI(urljoin("/", node.redirect)),
                permanent: false,
            },
        };
    }

    const featureFlags = await getFeatureFlags(xFernHost);

    setMdxBundler(await getMdxBundler(featureFlags.useMdxBundler ? "mdx-bundler" : "next-mdx-remote"));

    const resolvedPath = await convertNavigatableToResolvedPath({
        found: node,
        apis: docs.definition.apis,
        pages: docs.definition.pages,
        domain: docs.baseUrl.domain,
        featureFlags,
        mdxOptions: {
            files: docs.definition.jsFiles,
        },
    });

    if (resolvedPath == null) {
        // eslint-disable-next-line no-console
        console.error(`Failed to resolve path for ${url}`);
        return { type: "notFound", notFound: true };
    }

    const props: DocsPage.Props = {
        baseUrl: docs.baseUrl,
        layout: docs.definition.config.layout,
        title: docs.definition.config.title,
        favicon: docs.definition.config.favicon,
        colors: {
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
        },
        typography: docs.definition.config.typographyV2,
        css: docs.definition.config.css,
        js: docs.definition.config.js,
        navbarLinks: docs.definition.config.navbarLinks ?? [],
        logoHeight: docs.definition.config.logoHeight,
        logoHref:
            docs.definition.config.logoHref ??
            (node.landingPage?.slug != null && !node.landingPage.hidden ? `/${node.landingPage.slug}` : undefined),
        search: docs.definition.search,
        files: docs.definition.filesV2,
        resolvedPath,
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
            versions: node.versions
                .filter((version) => !version.hidden)
                .map((version, index) => ({
                    title: version.title,
                    id: version.versionId,
                    slug: version.slug,
                    index,
                    availability: version.availability,
                })),
            sidebar: node.sidebar,
        },
        featureFlags,
        apis: Object.keys(docs.definition.apis),
        seo: getDefaultSeoProps(
            docs.baseUrl.domain,
            docs.definition.config,
            docs.definition.pages,
            docs.definition.filesV2,
            docs.definition.apis,
            node.node,
        ),
        breadcrumb: getBreadcrumbList(docs.baseUrl.domain, docs.definition.pages, node.parents, node.node),
        user,
        apiKey,
        fallback: {},
        analytics: await getCustomerAnalytics(docs.baseUrl.domain, docs.baseUrl.basePath),
        theme: docs.baseUrl.domain.includes("cohere") ? "cohere" : "default",
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
        type: "props",
        props: JSON.parse(JSON.stringify(props)), // remove all undefineds
        revalidate: 60 * 60 * 24 * 6, // 6 days
    };
}

async function maybeGetWorkosOrganization(host: string): Promise<string | undefined> {
    const docsV2ReadClient = new FdrClient({
        environment: process.env.NEXT_PUBLIC_FDR_ORIGIN ?? "https://registry.buildwithfern.com",
    }).docs.v2.read;
    const maybeFernOrgId = await docsV2ReadClient.getOrganizationForUrl({ url: host });
    if (!maybeFernOrgId.ok) {
        return undefined;
    }
    const fernOrgId = maybeFernOrgId.body;
    const venusOrgClient = new FernVenusApiClient({
        environment: process.env.NEXT_PUBLIC_VENUS_ORIGIN ?? "https://venus.buildwithfern.com",
    }).organization;
    const maybeOrg = await venusOrgClient.get(FernVenusApi.OrganizationId(fernOrgId));
    if (!maybeOrg.ok) {
        return undefined;
    }
    return maybeOrg.body.workosOrganizationId;
}
