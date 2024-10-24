import { FernNavigation } from "@fern-api/fdr-sdk";
import { COOKIE_FERN_TOKEN } from "@fern-ui/fern-docs-utils";
import { type DocsPage } from "@fern-ui/ui";
import type { NextApiRequestCookies } from "next/dist/server/api-utils";
import type { GetServerSidePropsResult } from "next/types";
import type { ComponentProps } from "react";
import { getAuthState } from "./auth/getAuthState";
import { getDocsPageProps } from "./getDocsPageProps";

type GetServerSideDocsPagePropsResult = GetServerSidePropsResult<ComponentProps<typeof DocsPage>>;

export async function getDynamicDocsPageProps(
    domain: string,
    host: string,
    slug: FernNavigation.Slug,
    cookies: NextApiRequestCookies,
): Promise<GetServerSideDocsPagePropsResult> {
    const authState = await getAuthState(domain, cookies[COOKIE_FERN_TOKEN], `/${slug}`);

    /**
     * Authenticated user is guaranteed to have a valid token because the middleware
     * would have redirected them to the login page
     */
    return getDocsPageProps(domain, host, slug, authState);
}
