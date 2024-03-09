import { DocsV2Read, FdrClient } from "@fern-api/fdr-sdk";
import { FernVenusApi, FernVenusApiClient } from "@fern-api/venus-api-sdk";
import { buildUrl, convertNavigatableToResolvedPath, DocsPage, DocsPageResult, getNavigation } from "@fern-ui/ui";
import { jwtVerify } from "jose";
import type { Redirect } from "next";
import type { IncomingMessage, ServerResponse } from "node:http";
import { getAuthorizationUrl, getJwtTokenSecret } from "./auth";

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
    const docs = await REGISTRY_SERVICE.docs.v2.read.getDocsForUrl({ url });
    if (!docs.ok) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((docs.error as any).content.statusCode === 401) {
            return {
                type: "redirect",
                redirect: await getUnauthenticatedRedirect(xFernHost),
            };
        }

        // eslint-disable-next-line no-console
        console.error(`Failed to fetch docs for ${url}`, docs.error);
        return {
            type: "notFound",
            notFound: true,
        };
    }

    return convertDocsToDocsPageProps({ docs: docs.body, slug, url, xFernHost });
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
    const docs = await registryService.docs.v2.read.getPrivateDocsForUrl({ url });

    if (!docs.ok) {
        res.setHeader("Set-Cookie", "fern_token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0");

        if (docs.error.error === "UnauthorizedError") {
            return {
                type: "redirect",
                redirect: await getUnauthenticatedRedirect(xFernHost),
            };
        }

        // eslint-disable-next-line no-console
        console.error(`Failed to fetch docs for ${xFernHost}/${slug.join("/")}`, docs.error);
        return {
            type: "notFound",
            notFound: true,
        };
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
    const basePath = docs.baseUrl.basePath;
    const docsConfig = docsDefinition.config;

    const navigation = await getNavigation(slug, basePath, docs.definition.apis, docsConfig.navigation);

    if (navigation == null) {
        // eslint-disable-next-line no-console
        console.error(`Failed to resolve navigation for ${url}`);
        return { type: "notFound", notFound: true };
    }

    const resolvedPath = await convertNavigatableToResolvedPath({
        slug,
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

    const isApiPlaygroundEnabled = await fetch(`https://${xFernHost}/api/fern-docs/config/api-playground-enabled`, {
        headers: { "x-fern-host": xFernHost },
    })
        .then((r): Promise<boolean> => r.json())
        .catch((e) => {
            // eslint-disable-next-line no-console
            console.error("Failed to check if API Playground is enabled", e);
            return false;
        });

    const props: DocsPage.Props = {
        baseUrl: docs.baseUrl,
        layout: docs.definition.config.layout,
        title: docs.definition.config.title,
        favicon: docs.definition.config.favicon,
        backgroundImage: docs.definition.config.backgroundImage,
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
        algoliaSearchIndex: docs.definition.algoliaSearchIndex,
        files: docs.definition.filesV2,
        resolvedPath,
        navigation,
        isApiPlaygroundEnabled,
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
