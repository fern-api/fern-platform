/* eslint-disable import/no-internal-modules */
import { FdrClient } from "@fern-api/fdr-sdk";
import type { DocsV2Read } from "@fern-api/fdr-sdk/client/types";
import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { FernVenusApi, FernVenusApiClient } from "@fern-api/venus-api-sdk";
import { visitDiscriminatedUnion } from "@fern-ui/core-utils";
import { SidebarTab, buildUrl } from "@fern-ui/fdr-utils";
import { getSearchConfig } from "@fern-ui/search-utils";
import {
    DocsPage,
    convertNavigatableToResolvedPath,
    getGitHubInfo,
    getGitHubRepo,
    getSeoProps,
    provideRegistryService,
    renderThemeStylesheet,
    setMdxBundler,
} from "@fern-ui/ui";
import { FernUser, getAPIKeyInjectionConfigNode, getAuthEdgeConfig, verifyFernJWT } from "@fern-ui/ui/auth";
import { getMdxBundler } from "@fern-ui/ui/bundlers";
import type { GetServerSidePropsResult, GetStaticPropsResult, Redirect } from "next";
import { NextApiRequestCookies } from "next/dist/server/api-utils";
import { type IncomingMessage, type ServerResponse } from "node:http";
import { ComponentProps } from "react";
import { default as urlJoin, default as urljoin } from "url-join";
import { getFeatureFlags } from "../pages/api/fern-docs/feature-flags";
import { getCustomerAnalytics } from "./analytics";
import { getAuthorizationUrl } from "./auth";
import { convertStaticToServerSidePropsResult } from "./convertStaticToServerSidePropsResult";
import { getSeoDisabled } from "./disabledSeo";
import { getRedirectForPath } from "./hackRedirects";

type GetStaticDocsPagePropsResult = GetStaticPropsResult<ComponentProps<typeof DocsPage>>;
type GetServerSideDocsPagePropsResult = GetServerSidePropsResult<ComponentProps<typeof DocsPage>>;

async function getUnauthenticatedRedirect(xFernHost: string, path: string): Promise<Redirect> {
    const authorizationUrl = getAuthorizationUrl(
        {
            organization: await maybeGetWorkosOrganization(xFernHost),
            state: urlJoin(`https://${xFernHost}`, path),
        },
        xFernHost,
    );
    return { destination: authorizationUrl, permanent: false };
}

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
): Promise<GetStaticDocsPagePropsResult> {
    if (xFernHost == null || Array.isArray(xFernHost)) {
        return { notFound: true };
    }

    const config = await getAuthEdgeConfig(xFernHost);
    if (config != null && config.type === "basic_token_verification") {
        const destination = new URL(config.redirect);
        destination.searchParams.set("state", urlJoin(`https://${xFernHost}`, `/${slug.join("/")}`));
        return {
            redirect: {
                // TODO: this will break if the docs tenant uses basepaths
                destination: `/api/fern-docs/redirect?destination=${encodeURIComponent(destination.toString())}`,
                permanent: false,
            },
        };
    }

    const pathname = decodeURI(slug != null ? slug.join("/") : "");
    const url = buildUrl({ host: xFernHost, pathname });
    // eslint-disable-next-line no-console
    console.log("[getDocsPageProps] Loading docs for", url);
    const start = Date.now();
    const docs = await provideRegistryService().docs.v2.read.getDocsForUrl({ url });
    const end = Date.now();
    // eslint-disable-next-line no-console
    console.log(`[getDocsPageProps] Fetch completed in ${end - start}ms for ${url}`);
    if (!docs.ok) {
        if ((docs.error as any).content.statusCode === 401) {
            return { redirect: await getUnauthenticatedRedirect(xFernHost, `/${slug.join("/")}`) };
        } else if ((docs.error as any).content.statusCode === 404) {
            return { notFound: true };
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
    _res: ServerResponse<IncomingMessage>,
): Promise<GetServerSideDocsPagePropsResult> {
    const url = buildUrl({ host: xFernHost, pathname: slug.join("/") });
    if (cookies.fern_token == null) {
        return convertStaticToServerSidePropsResult(await getDocsPageProps(xFernHost, slug));
    }

    try {
        const config = await getAuthEdgeConfig(xFernHost);
        let user: FernUser | undefined = undefined;

        // using custom auth (e.g. qlty, propexo, etc)
        if (config?.type === "basic_token_verification") {
            try {
                user = await verifyFernJWT(cookies.fern_token, config.secret, config.issuer);
            } catch (error) {
                // eslint-disable-next-line no-console
                console.error(error);
                const destination = new URL(config.redirect);
                destination.searchParams.set("state", urlJoin(`https://${xFernHost}`, `/${slug.join("/")}`));
                return {
                    redirect: {
                        destination: `/api/fern-docs/redirect?destination=${encodeURIComponent(destination.toString())}`,
                        permanent: false,
                    },
                };
            }
        } else {
            user = await verifyFernJWT(cookies.fern_token);
        }

        // SSO
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
                if (docs.error.error === "UnauthorizedError") {
                    return {
                        redirect: await getUnauthenticatedRedirect(xFernHost, `/${slug.join("/")}`),
                    };
                }

                // eslint-disable-next-line no-console
                console.error(`[getDynamicDocsPageProps] Failed to fetch docs for ${url}`, docs.error);
                throw new Error("Failed to fetch private docs");
            }

            return convertDocsToDocsPageProps({ docs: docs.body, slug, url, xFernHost });
        } else if (user.partner === "ory" || user.partner === "custom") {
            // rightbrain's api key injection
            const docs = await provideRegistryService().docs.v2.read.getDocsForUrl({ url });

            if (!docs.ok) {
                throw new Error("Failed to fetch docs");
            }

            if (config == null) {
                throw new Error("Failed to fetch OAuth config");
            }

            return convertStaticToServerSidePropsResult(
                await convertDocsToDocsPageProps({
                    docs: docs.body,
                    slug,
                    url,
                    xFernHost,
                    user,
                    cookies,
                }),
            );
        }
    } catch (error) {
        // eslint-disable-next-line no-console
        console.log(error);
    }

    // fallback to public docs
    return convertStaticToServerSidePropsResult(await getDocsPageProps(xFernHost, slug));
}

async function convertDocsToDocsPageProps({
    docs,
    slug: slugArray,
    url,
    xFernHost,
    user,
    cookies,
}: {
    docs: DocsV2Read.LoadDocsForUrlResponse;
    slug: string[];
    url: string;
    xFernHost: string;
    user?: FernUser;
    cookies?: NextApiRequestCookies;
}): Promise<GetStaticPropsResult<ComponentProps<typeof DocsPage>>> {
    const docsDefinition = docs.definition;
    const docsConfig = docsDefinition.config;

    const slug = FernNavigation.utils.slugjoin(...slugArray);
    const currentPath = urljoin("/", slug);

    const redirect = getRedirectForPath(currentPath, docs.baseUrl, docsConfig.redirects);

    if (redirect != null) {
        return {
            redirect: {
                destination: redirect.destination,
                permanent: false,
            },
        };
    }

    const featureFlags = await getFeatureFlags(xFernHost);
    const root = FernNavigation.utils.convertLoadDocsForUrlResponse(
        docs,
        featureFlags.isBatchStreamToggleDisabled,
        featureFlags.isApiScrollingDisabled,
    );
    const node = FernNavigation.utils.findNode(root, slug);

    if (node.type === "notFound") {
        // eslint-disable-next-line no-console
        console.error(`Failed to resolve navigation for ${url}`);
        if (node.redirect != null) {
            return {
                // urljoin is bizarre: urljoin("/", "") === "", urljoin("/", "/") === "/", urljoin("/", "/a") === "/a"
                // "" || "/" === "/"
                redirect: {
                    destination: encodeURI(urljoin("/", node.redirect) || "/"),
                    permanent: false,
                },
            };
        }
        return { notFound: true };
    }

    if (node.type === "redirect") {
        return {
            redirect: {
                destination: encodeURI(urljoin("/", node.redirect)),
                permanent: false,
            },
        };
    }

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

    const props: ComponentProps<typeof DocsPage> = {
        baseUrl: docs.baseUrl,
        layout: docs.definition.config.layout,
        title: docs.definition.config.title,
        favicon: docs.definition.config.favicon,
        colors,
        js: docs.definition.config.js,
        navbarLinks: docs.definition.config.navbarLinks ?? [],
        logoHeight: docs.definition.config.logoHeight,
        logoHref:
            docs.definition.config.logoHref ??
            (node.landingPage?.slug != null && !node.landingPage.hidden ? `/${node.landingPage.slug}` : undefined),
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
        seo: getSeoProps(
            docs.baseUrl.domain,
            docs.definition.config,
            docs.definition.pages,
            docs.definition.filesV2,
            docs.definition.apis,
            node,
            await getSeoDisabled(xFernHost),
        ),
        user,
        fallback: {},
        analytics: await getCustomerAnalytics(docs.baseUrl.domain, docs.baseUrl.basePath),
        theme: featureFlags.isSpecialTheme ? "cohere" : "default",
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

    // note: if the first argument of urjoin is "", it will strip the leading slash. `|| "/"` ensures "" -> "/"
    props.fallback[urljoin(docs.baseUrl.basePath || "/", "/api/fern-docs/search")] = await getSearchConfig(
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

    const apiKeyInjectionConfig = await getAPIKeyInjectionConfigNode(xFernHost, cookies);
    // note: if the first argument of urjoin is "", it will strip the leading slash. `|| "/"` ensures "" -> "/"
    props.fallback[urljoin(docs.baseUrl.basePath || "/", "/api/fern-docs/auth/api-key-injection")] =
        apiKeyInjectionConfig;

    return {
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
