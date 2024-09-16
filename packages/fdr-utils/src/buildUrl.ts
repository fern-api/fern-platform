import urljoin from "url-join";

export function buildUrl({ host, pathname }: { host: string; pathname: string }): string {
    host = host.replace(".docs.staging.", ".docs.");
    return urljoin(host, pathname);
}
