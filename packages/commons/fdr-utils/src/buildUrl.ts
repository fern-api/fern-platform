export function buildUrl({ host, pathname }: { host: string; pathname: string }): string {
    let toRet = host.replace(/\/$/, "");
    if (pathname.length > 0) {
        toRet = `${toRet}/${pathname.replace(/^\//, "").replace(/\/$/, "")}`;
    }

    return encodeURI(toRet);
}

export function stripStagingUrl(url: string): string {
    return url.replace(".docs.staging.buildwithfern.com", ".docs.buildwithfern.com");
}

export function getHostFromUrl(url: string): string;
export function getHostFromUrl(url: string | undefined): string | undefined;
export function getHostFromUrl(url: string | undefined): string | undefined {
    if (url == null) {
        return undefined;
    }
    if (!hasProtocol(url)) {
        url = `https://${url}`;
    }
    const urlObj = new URL(url);
    return urlObj.host;
}

function hasProtocol(url: string): boolean {
    return /^https?:\/\//.test(url);
}
