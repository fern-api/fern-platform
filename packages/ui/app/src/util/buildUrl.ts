export function buildUrl({ host, pathname }: { host: string; pathname: string }): string {
    let hostWithoutTrailingSlash = host.endsWith("/") ? host.slice(0, -1) : host;
    hostWithoutTrailingSlash = hostWithoutTrailingSlash.replace(".docs.staging.", ".docs.");
    if (pathname.length === 0) {
        return hostWithoutTrailingSlash;
    }
    return `${hostWithoutTrailingSlash}/${pathname}`;
}
