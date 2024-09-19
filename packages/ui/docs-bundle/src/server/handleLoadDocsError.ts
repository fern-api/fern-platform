import type { FdrAPI } from "@fern-api/fdr-sdk";
import type { Redirect } from "next/types";
import { getUnauthenticatedRedirect } from "./getUnauthenticatedRedirect";

export async function handleLoadDocsError(
    xFernHost: string,
    slug: string[],
    error: FdrAPI.docs.v2.read.getDocsForUrl.Error,
): Promise<{ redirect: Redirect } | { notFound: true }> {
    if (error.error === "UnauthorizedError") {
        const redirect = await getUnauthenticatedRedirect(xFernHost, encodeURI(slug.join("/")));
        return { redirect };
    } else if (error.error === "DomainNotRegisteredError") {
        return { notFound: true };
    }

    // eslint-disable-next-line no-console
    console.error(`Failed to load initial props for docs page: https://${xFernHost}/${slug.join("/")}`);
    return { notFound: true };
}
