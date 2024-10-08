import { COOKIE_FERN_TOKEN } from "@fern-ui/fern-docs-utils";
import { type DocsPage } from "@fern-ui/ui";
import type { NextApiRequestCookies } from "next/dist/server/api-utils";
import type { GetServerSidePropsResult } from "next/types";
import type { ComponentProps } from "react";
import { withAuthProps } from "./authProps";
import { getDocsPageProps } from "./getDocsPageProps";

type GetServerSideDocsPagePropsResult = GetServerSidePropsResult<ComponentProps<typeof DocsPage>>;

export async function getDynamicDocsPageProps(
    xFernHost: string,
    slug: string[],
    cookies: NextApiRequestCookies,
): Promise<GetServerSideDocsPagePropsResult> {
    if (cookies[COOKIE_FERN_TOKEN] == null) {
        /**
         * this only happens when ?error=true is passed in the URL
         * Note: custom auth (via edge config) is supported via middleware, so we don't need to handle it here
         */
        return getDocsPageProps(xFernHost, slug);
    }

    /**
     * Authenticated user is guaranteed to have a valid token because the middleware
     * would have redirected them to the login page
     */
    const authProps = await withAuthProps(xFernHost, cookies[COOKIE_FERN_TOKEN]);
    return getDocsPageProps(xFernHost, slug, authProps);
}
