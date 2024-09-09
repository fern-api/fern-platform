import type PageLoader from "next/dist/client/page-loader";
import { Router } from "next/router";
import { useEffect } from "react";

// hack for basepath: https://github.com/vercel/next.js/discussions/25681#discussioncomment-2026813
export const useInterceptNextDataHref = ({
    router,
    basePath,
    host,
}: {
    router: Router;
    basePath: string | undefined;
    host: string | undefined;
}): void => {
    useEffect(() => {
        try {
            if (basePath != null && basePath !== "" && basePath !== "/" && router.pageLoader?.getDataHref) {
                const prefixedBasePath = basePath.startsWith("/") ? basePath : `/${basePath}`;

                const originalGetDataHref = router.pageLoader.getDataHref;
                router.pageLoader.getDataHref = function (...args: Parameters<PageLoader["getDataHref"]>) {
                    const r = originalGetDataHref.call(router.pageLoader, ...args);
                    return r && r.startsWith("/_next/data") ? fixHost(`${prefixedBasePath}${r}`, host) : r;
                };
            }
        } catch (e) {
            // eslint-disable-next-line no-console
            console.error("Failed to intercept next data href", e);
        }
    }, [router, basePath, host]);
};

function fixHost(path: string, host: string | undefined) {
    // path is like /_next/data/development/.../index.json?host=docs&slug=x&slug=x
    // we want to replace the host with the actual host like docs.devexpress.com
    if (host == null) {
        return path;
    }
    if (!path.includes("?") || path.includes(`?host=${host}`)) {
        return path;
    }

    // use regex to replace ?host=docs&slug=x&slug=x with ?host=docs.devexpress.com&slug=host&slug=x&slug=x
    return path.replace(/(\?host=)([^&]+)/, `$1${host}&slug=$2`);
}
