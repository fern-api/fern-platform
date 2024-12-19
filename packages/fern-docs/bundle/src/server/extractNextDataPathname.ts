/**
 * when prefetching `/learn/_next/data/build-id/learn/home.json`, sometimes the pathname is interpreted as
 * `/learn/_next/data/build-id/learn/_next/data/build-id/learn/home.json.json`.
 *
 * This is a bug in Next.js that we need to work around.
 *
 * In both cases, we want to extract `/learn/home`
 */
export function extractNextDataPathname(pathname: string): string {
    if (pathname.includes("/404.json")) {
        return "/404";
    } else if (pathname.includes("/_error.json")) {
        return "/_error";
    }

    return (
        removeIndex(
            pathname.match(
                /\/_next\/data\/.*\/_next\/data\/[^/]*(\/.*)\.json.json/
            )?.[1] ?? pathname.match(/\/_next\/data\/[^/]*(\/.*)\.json/)?.[1]
        ) ?? pathname
    );
}

function removeIndex(pathname: string | undefined): string | undefined {
    if (pathname === "/index") {
        return "/";
    }
    return pathname;
}

export function extractBuildId(pathname: string): string | undefined {
    return pathname.match(/\/_next\/data\/([^/]+)\//)?.[1];
}
