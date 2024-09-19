import type { DocsV1Read, DocsV2Read } from "@fern-api/fdr-sdk/client/types";
import * as Sentry from "@sentry/nextjs";
import { removeTrailingSlash } from "next/dist/shared/lib/router/utils/remove-trailing-slash";
import type { Redirect } from "next/types";
import { compile, match } from "path-to-regexp";
import urljoin from "url-join";

export function getRedirectForPath(
    pathWithoutBasepath: string,
    baseUrl: DocsV2Read.BaseUrl,
    redirects: DocsV1Read.RedirectConfig[] = [],
): { redirect: Redirect } | undefined {
    for (const redirect of redirects) {
        const source = removeTrailingSlash(withBasepath(redirect.source, baseUrl.basePath));
        try {
            const sourceFn = match(source, { decode: false });
            const result = sourceFn(pathWithoutBasepath);
            console.log(pathWithoutBasepath, source, result);
            if (result) {
                const destFn = compile(redirect.destination, { encode: false });
                const destination = destFn(result.params);

                // eslint-disable-next-line no-console
                console.debug({ match: redirect, result });

                // note: Do NOT conform trailing slash here because this relies on the user's direct configuration
                return { redirect: { destination, permanent: redirect.permanent ?? false } };
            }
        } catch (e) {
            // eslint-disable-next-line no-console
            console.debug(e, { source, pathWithoutBasepath, redirect });
            Sentry.captureException(e, {
                level: "warning",
                extra: {
                    context: "DocsBundle.utils",
                    errorSource: "getRedirectForPath",
                    errorDescription: "Failed to match redirect path",
                    data: { baseUrl, pathWithoutBasepath, redirect },
                },
            });
        }
    }
    return undefined;
}

function withBasepath(source: string, basePath: string | undefined): string {
    return basePath == null ? source : source.startsWith(basePath) ? source : urljoin(basePath, source);
}
