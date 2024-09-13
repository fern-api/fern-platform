/* eslint-disable import/no-internal-modules */
import type { DocsV2Read } from "@fern-api/fdr-sdk/client/types";
import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { FernVenusApi, FernVenusApiClient } from "@fern-api/venus-api-sdk";
import { visitDiscriminatedUnion } from "@fern-ui/core-utils";
import { SidebarTab, buildUrl } from "@fern-ui/fdr-utils";
import { getSearchConfig } from "@fern-ui/search-utils";
import { getMdxBundler } from "@fern-ui/ui/bundlers";
import type { GetServerSidePropsResult, GetStaticPropsResult, Redirect } from "next";
import { NextApiRequestCookies } from "next/dist/server/api-utils";
import { type IncomingMessage, type ServerResponse } from "node:http";
import { default as urlJoin, default as urljoin } from "url-join";
import { DocsProps } from "./DocsProps";
import { getCustomerAnalytics } from "./analytics";
import { FernUser, getAPIKeyInjectionConfigNode, getAuthEdgeConfig, verifyFernJWTConfig } from "./auth";
import { getAuthorizationUrl } from "./auth/workos";
import { convertStaticToServerSidePropsResult } from "./convertStaticToServerSidePropsResult";
import { getSeoDisabled } from "./disabledSeo";
import { trackPromiseDuration } from "./events";
import { getFeatureFlags } from "./featureFlags";
import { getRedirectForPath } from "./getRedirectForPath";
import { getRegistryServiceWithToken, provideRegistryService } from "./registry";
import { conformTrailingSlash, isTrailingSlashEnabled } from "./trailingSlash";

type GetStaticDocsPagePropsResult = GetStaticPropsResult<DocsProps>;
type GetServerSideDocsPagePropsResult = GetServerSidePropsResult<DocsProps>;

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

export interface User {
    isAuthenticated: boolean;
    user?: FernUser;
}

export async function getDocsPageProps(
    xFernHost: string | undefined,
    slug: string[],
): Promise<GetStaticDocsPagePropsResult> {
    if (xFernHost == null || Array.isArray(xFernHost)) {
        return { notFound: true, revalidate: true };
    }

    const pathname = decodeURI(slug != null ? slug.join("/") : "");
    const url = buildUrl({ host: xFernHost, pathname });

    const docs = await trackPromiseDuration(
        provideRegistryService().docs.v2.read.getDocsForUrl({ url }),
        "load-docs-for-url",
        url,
    );

    if (!docs.ok) {
        if ((docs.error as any).content.statusCode === 401) {
            return { redirect: await getUnauthenticatedRedirect(xFernHost, `/${slug.join("/")}`), revalidate: true };
        } else if ((docs.error as any).content.statusCode === 404) {
            return { notFound: true, revalidate: true };
        }
        throw new Error("Failed to fetch docs for ${url}", { cause: docs.error });
    }

    const toRet = await trackPromiseDuration(
        convertDocsToDocsPageProps({ docs: docs.body, slug, xFernHost }),
        "serialize-mdx",
        url,
    );

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
        const user: FernUser | undefined = await verifyFernJWTConfig(cookies.fern_token, config);

        // SSO
        if (user.partner === "workos") {
            const registryService = getRegistryServiceWithToken(`workos_${cookies.fern_token}`);

            const docs = await trackPromiseDuration(
                registryService.docs.v2.read.getPrivateDocsForUrl({ url }),
                "load-private-docs-for-url",
                url,
            );

            if (!docs.ok) {
                if (docs.error.error === "UnauthorizedError") {
                    return { redirect: await getUnauthenticatedRedirect(xFernHost, `/${slug.join("/")}`) };
                }

                throw new Error("Failed to fetch private docs for ${url}", { cause: docs.error });
            }

            return convertDocsToDocsPageProps({ docs: docs.body, slug, xFernHost });
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
                    xFernHost,
                    user,
                    cookies,
                }),
            );
        }
    } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error);
    }

    // fallback to public docs
    return convertStaticToServerSidePropsResult(await getDocsPageProps(xFernHost, slug));
}

async function convertDocsToDocsPageProps({
    docs,
    slug: slugArray,
    xFernHost,
    user,
    cookies,
}: {
    docs: DocsV2Read.LoadDocsForUrlResponse;
    slug: string[];
    xFernHost: string;
    user?: FernUser;
    cookies?: NextApiRequestCookies;
}): Promise<GetStaticPropsResult<DocsProps>> {
    const docsDefinition = docs.definition;
    const docsConfig = docsDefinition.config;

    const slug = FernNavigation.utils.slugjoin(...slugArray);
    const currentPath = urljoin("/", slug);

    const redirect = getRedirectForPath(currentPath, docs.baseUrl, docsConfig.redirects);

    if (redirect != null) {
        return {
            redirect: {
                destination: conformTrailingSlash(redirect.destination),
                permanent: redirect.permanent ?? false,
            },
            revalidate: true,
        };
    }

    const featureFlags = await getFeatureFlags(xFernHost);
    const root = FernNavigation.utils.convertLoadDocsForUrlResponse(
        docs,
        featureFlags.isBatchStreamToggleDisabled,
        featureFlags.isApiScrollingDisabled,
    );

    // if the root has a slug and the current slug is empty, redirect to the root slug, rather than 404
    if (root.slug.length > 0 && slug.length === 0) {
        return {
            redirect: {
                destination: encodeURI(urljoin("/", root.slug)),
                permanent: false,
            },
            revalidate: true,
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
                // urljoin is bizarre: urljoin("/", "") === "", urljoin("/", "/") === "/", urljoin("/", "/a") === "/a"
                // "" || "/" === "/"
                redirect: {
                    destination: encodeURI(urljoin("/", node.redirect) || "/"),
                    permanent: false,
                },
                revalidate: true,
            };
        }

        return { notFound: true, revalidate: true };
    }

    if (node.type === "redirect") {
        return {
            redirect: {
                destination: encodeURI(urljoin("/", node.redirect)),
                permanent: false,
            },
            revalidate: true,
        };
    }

    setMdxBundler(await getMdxBundler(featureFlags.useMdxBundler ? "mdx-bundler" : "next-mdx-remote"));

    const content = await resolveDocsContent({
        found: node,
        apis: docs.definition.apis,
        pages: docs.definition.pages,
        domain: docs.baseUrl.domain,
        featureFlags,
        mdxOptions: {
            files: docs.definition.jsFiles,
        },
    });

    if (content == null) {
        return { notFound: true, revalidate: true };
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

    const versions = node.versions
        .filter((version) => !version.hidden)
        .map((version, index) => {
            // if the same page exists in multiple versions, return the full slug of that page, otherwise default to version's landing page (pointsTo)
            const expectedSlug = FernNavigation.utils.slugjoin(version.slug, node.unversionedSlug);
            const pointsTo = node.collector.slugMap.has(expectedSlug) ? expectedSlug : version.pointsTo;

            return {
                title: version.title,
                id: version.versionId,
                slug: version.slug,
                pointsTo,
                index,
                availability: version.availability,
            };
        });

    const props: DocsProps = {
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

    const apiKeyInjectionConfig = await getAPIKeyInjectionConfigNode(xFernHost, cookies);
    props.fallback[getApiRoute("/api/fern-docs/auth/api-key-injection")] = apiKeyInjectionConfig;

    return {
        props: JSON.parse(JSON.stringify(props)), // remove all undefineds
        revalidate: 60 * 60 * 24 * 6, // 6 days
    };
}

async function maybeGetWorkosOrganization(host: string): Promise<string | undefined> {
    const docsV2ReadClient = provideRegistryService().docs.v2.read;
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
