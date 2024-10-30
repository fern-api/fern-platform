import type { FdrAPI, FernNavigation } from "@fern-api/fdr-sdk";
import type { Redirect } from "next/types";

export async function handleLoadDocsError(
    xFernHost: string,
    slug: FernNavigation.Slug,
    error: FdrAPI.docs.v2.read.getDocsForUrl.Error,
): Promise<{ redirect: Redirect } | { notFound: true }> {
    if (error.error === "DomainNotRegisteredError") {
        // TODO: emit a telemetry event
        return { notFound: true };
    }

    // eslint-disable-next-line no-console
    console.error(`Failed to load initial props for docs page: https://${xFernHost}/${slug}`, error.content);
    return { notFound: true };
}
