import { COOKIE_FERN_TOKEN } from "@fern-ui/fern-docs-utils";
import { type DocsPage } from "@fern-ui/ui";
import type { NextApiRequestCookies } from "next/dist/server/api-utils";
import type { GetServerSidePropsResult } from "next/types";
import type { ComponentProps } from "react";
import { AuthProps, withAuthProps } from "./authProps";
import { getDocsPageProps } from "./getDocsPageProps";

type GetServerSideDocsPagePropsResult = GetServerSidePropsResult<ComponentProps<typeof DocsPage>>;

export async function getDynamicDocsPageProps(
    domain: string,
    host: string,
    slug: string[],
    cookies: NextApiRequestCookies,
): Promise<GetServerSideDocsPagePropsResult> {
    let authProps: AuthProps | undefined;

    try {
        if (cookies[COOKIE_FERN_TOKEN]) {
            authProps = await withAuthProps(domain, cookies[COOKIE_FERN_TOKEN]);
        }
    } catch (e) {
        // eslint-disable-next-line no-console
        console.error("Failed to get auth props", e);
    }

    /**
     * Authenticated user is guaranteed to have a valid token because the middleware
     * would have redirected them to the login page
     */
    return getDocsPageProps(domain, host, slug, authProps);
}
