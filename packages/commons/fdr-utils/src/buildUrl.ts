// returns: `mydocs.docs.buildwithfern.com/path/to/page`
export function buildUrl({ host, pathname }: { host: string; pathname?: string }): string {
    // Remove protocol if it exists
    host = host.replace(/(^\w+:|^)\/\//, "");

    // Remove trailing slash at the end of the host
    host = host.endsWith("/") ? host.slice(0, -1) : host;

    // Remove '.staging' if it exists
    host = host.replace(".docs.staging.", ".docs.");

    if (pathname == null || pathname.length === 0) {
        return host;
    }

    // Remove leading slash at the start of the pathname
    pathname = pathname.startsWith("/") ? pathname.slice(1) : pathname;

    return `${host}/${pathname}`;
}
