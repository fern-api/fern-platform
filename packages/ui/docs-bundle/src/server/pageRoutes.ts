import getAssetPathFromRoute from "next/dist/shared/lib/router/utils/get-asset-path-from-route";
import { removeTrailingSlash } from "next/dist/shared/lib/router/utils/remove-trailing-slash";
import urlJoin from "url-join";

export function getPageRoute(ssg: boolean, domain: string, pathname: string): string {
    const prefix = ssg ? "static" : "dynamic";
    return urlJoin("/", prefix, domain, pathname);
}

export function getPageRouteMatch(ssg: boolean, buildId: string): string {
    return `/_next/data/${buildId}/${ssg ? "static" : "dynamic"}/[domain]/[[...slug]].json`;
}

export function getPageRoutePath(ssg: boolean, buildId: string, domain: string, pathname: string): string {
    const dataRoute = getAssetPathFromRoute(removeTrailingSlash(pathname), ".json");
    return `/_next/data/${buildId}/${ssg ? "static" : "dynamic"}/${domain}${dataRoute}`;
}
