import { FdrClient, FernNavigation, type DocsV2Read } from "@fern-api/fdr-sdk";
import { FernVenusApi, FernVenusApiClient } from "@fern-api/venus-api-sdk";
import { visitDiscriminatedUnion } from "@fern-ui/core-utils";
import { SidebarTab, buildUrl } from "@fern-ui/fdr-utils";
import { DocsPage, DocsPageResult, convertNavigatableToResolvedPath, getDefaultSeoProps } from "@fern-ui/ui";
import { jwtVerify } from "jose";
import type { Redirect } from "next";
import type { IncomingMessage, ServerResponse } from "node:http";
import urljoin from "url-join";
import { getFeatureFlags } from "../pages/api/fern-docs/feature-flags";
import { getAuthorizationUrl, getJwtTokenSecret } from "./auth";
import { getRedirectForPath } from "./hackRedirects";

async function getUnauthenticatedRedirect(xFernHost: string): Promise<Redirect> {
    const authorizationUrl = getAuthorizationUrl(
        { organization: await maybeGetWorkosOrganization(xFernHost) },
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
    user?: unknown;
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
                redirect: await getUnauthenticatedRedirect(xFernHost),
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

export async function getPrivateDocsPageProps(
    xFernHost: string,
    slug: string[],
    token: string,
    res: ServerResponse<IncomingMessage>,
): Promise<DocsPageResult<DocsPage.Props>> {
    const user: User = await getUser(token);

    if (!user.isAuthenticated) {
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

    const registryService = getRegistryServiceWithToken(`workos_${token}`);

    const url = buildUrl({ host: xFernHost, pathname: slug.join("/") });
    // eslint-disable-next-line no-console
    console.log("[getPrivateDocsPageProps] Loading docs for", url);
    const start = Date.now();
    const docs = await registryService.docs.v2.read.getPrivateDocsForUrl({ url });
    const end = Date.now();
    // eslint-disable-next-line no-console
    console.log(`[getPrivateDocsPageProps] Fetch completed in ${end - start}ms for ${url}`);

    if (!docs.ok) {
        res.setHeader("Set-Cookie", "fern_token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0");

        if (docs.error.error === "UnauthorizedError") {
            return {
                type: "redirect",
                redirect: await getUnauthenticatedRedirect(xFernHost),
            };
        }

        // eslint-disable-next-line no-console
        console.error(`[getPrivateDocsPageProps] Failed to fetch docs for ${url}`, docs.error);
        throw new Error("Failed to fetch private docs");
    }

    return convertDocsToDocsPageProps({ docs: docs.body, slug, url, xFernHost });
}

async function getUser(token: string | undefined): Promise<User> {
    if (token == null) {
        return { isAuthenticated: false };
    }

    // Verify the JWT signature
    try {
        const verifiedToken = await jwtVerify(token, getJwtTokenSecret());

        // Return the User object if the token is valid
        return {
            isAuthenticated: true,
            user: verifiedToken.payload.user,
        };
    } catch {
        return { isAuthenticated: false };
    }
}

async function convertDocsToDocsPageProps({
    docs,
    slug,
    url,
    xFernHost,
}: {
    docs: DocsV2Read.LoadDocsForUrlResponse;
    slug: string[];
    url: string;
    xFernHost: string;
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
    console.log(node);

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

    const resolvedPath = await convertNavigatableToResolvedPath({
        found: node,
        apis: docs.definition.apis,
        pages: docs.definition.pages,
        domain: docs.baseUrl.domain,
        featureFlags,
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
        logoHref: docs.definition.config.logoHref,
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
    };

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
