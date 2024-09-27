import type { DocsV1Read, DocsV2Read } from "@fern-api/fdr-sdk/client/types";
import { removeTrailingSlash } from "next/dist/shared/lib/router/utils/remove-trailing-slash";
import type { Redirect } from "next/types";
import { compile, match } from "path-to-regexp";
import urljoin from "url-join";

function safeMatch(source: string, path: string): ReturnType<ReturnType<typeof match>> {
    if (source === path) {
        return { params: {}, path, index: 0 };
    }
    try {
        return match(source)(path);
    } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e, { source, path });
        return false;
    }
}

function safeCompile(
    destination: string,
    match: Exclude<ReturnType<typeof safeMatch>, false>,
): ReturnType<ReturnType<typeof compile>> {
    try {
        return compile(destination)(match.params);
    } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e, { match, destination });
        return destination;
    }
}

export function getRedirectForPath(
    pathWithoutBasepath: string,
    baseUrl: DocsV2Read.BaseUrl,
    redirects: DocsV1Read.RedirectConfig[] = [],
): { redirect: Redirect } | undefined {
    for (const redirect of redirects) {
        const source = removeTrailingSlash(withBasepath(redirect.source, baseUrl.basePath));
        const result = safeMatch(source, pathWithoutBasepath);
        if (result) {
            const destination = safeCompile(redirect.destination, result);

            // eslint-disable-next-line no-console
            console.debug({ match: redirect, result });

            if (!destination.startsWith("/")) {
                try {
                    new URL(destination);
                } catch (e) {
                    // eslint-disable-next-line no-console
                    console.error("Invalid redirect destination:", destination);
                    return undefined;
                }
            }

            // - Do NOT conform trailing slash in the destination because this relies on the user's direct configuration
            // - Do encode the URI to prevent any potential issues with special characters
            return { redirect: { destination: encodeURI(destination), permanent: redirect.permanent ?? false } };
        }
    }
    return undefined;
}

function withBasepath(source: string, basePath: string | undefined): string {
    return basePath == null ? source : source.startsWith(basePath) ? source : urljoin(basePath, source);
}
