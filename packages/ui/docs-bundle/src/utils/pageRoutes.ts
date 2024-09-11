import urlJoin from "url-join";

export function getPageRoute(ssg: boolean, host: string, pathname: string): string {
    const prefix = ssg ? "static" : "dynamic";
    return urlJoin("/", prefix, host, pathname);
}

export function getPageRouteMatch(ssg: boolean, buildId: string): string {
    return `/_next/data/${buildId}/${ssg ? "static" : "dynamic"}/[host]/[[...slug]].json`;
}
