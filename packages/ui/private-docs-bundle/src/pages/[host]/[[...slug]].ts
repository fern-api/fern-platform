import { FdrClient } from "@fern-api/fdr-sdk";
import { FernVenusApi, FernVenusApiClient } from "@fern-api/venus-api-sdk";
import { buildUrl, createDocsPageProps, DocsPage, getResolvedNavigatable } from "@fern-ui/ui";
import { getCookie } from "cookies-next";
import { jwtVerify } from "jose";
import { compact } from "lodash-es";
import { GetServerSideProps } from "next";
import { getAuthorizationUrl, getJwtTokenSecret } from "../../auth";

export default DocsPage;

export const getServerSideProps: GetServerSideProps<DocsPage.Props> = async ({ params = {}, req, res }) => {
    const xFernHost = process.env.NEXT_PUBLIC_DOCS_DOMAIN ?? (params.host as string);
    const slugArray = compact(params.slug);

    const token = getCookie("token", { req, res });
    const user: User = await getUser(token);

    if (!user.isAuthenticated) {
        return {
            redirect: {
                destination: getAuthorizationUrl({
                    organization: await maybeGetWorkosOrganization(xFernHost),
                }),
                permanent: false,
            },
        };
    }

    if (xFernHost == null || Array.isArray(xFernHost)) {
        return { type: "notFound", notFound: true };
    }

    const docsV2ReadClient = new FdrClient({
        environment: process.env.NEXT_PUBLIC_FDR_ORIGIN ?? "https://registry.buildwithfern.com",
        // prefix token with `workos_` to signify that it's a WorkOS token in Venus
        token: token != null ? `workos_${token}` : undefined,
    }).docs.v2.read;
    const pathname = slugArray != null ? slugArray.join("/") : "";
    const docs = await docsV2ReadClient.getPrivateDocsForUrl({
        url: buildUrl({ host: xFernHost, pathname }),
    });

    if (!docs.ok) {
        // eslint-disable-next-line no-console
        console.error(`Failed to fetch docs for path: /${pathname}`, docs.error);
        return { notFound: true };
    }

    const resolvedNavigatable = getResolvedNavigatable(docs.body, pathname);

    if (resolvedNavigatable == null) {
        // eslint-disable-next-line no-console
        console.error(`Cannot resolve navigatable corresponding to "${pathname}"`);
        return { notFound: true };
    }

    return {
        props: await createDocsPageProps(docs.body, resolvedNavigatable),
    };
};

export interface User {
    isAuthenticated: boolean;
    user?: unknown;
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
