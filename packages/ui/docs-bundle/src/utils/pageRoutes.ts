import { addPathPrefix } from "next/dist/shared/lib/router/utils/add-path-prefix";
import { addPathSuffix } from "next/dist/shared/lib/router/utils/add-path-suffix";
import getAssetPathFromRoute from "next/dist/shared/lib/router/utils/get-asset-path-from-route";
import { removeTrailingSlash } from "next/dist/shared/lib/router/utils/remove-trailing-slash";
import urlJoin from "url-join";

export function getPageRoute(ssg: boolean, host: string, pathname: string): string {
    const prefix = ssg ? "static" : "dynamic";
    return urlJoin("/", prefix, host, pathname);
}

export function getPageRouteMatch(ssg: boolean, buildId: string): string {
    return addPathPrefix(
        addPathSuffix(`addPathSuffix/${ssg ? "static" : "dynamic"}/[host]/[[...slug]]`, ".json"),
        `/_next/data/${buildId}`,
    );
}

export function getPageRoutePath(ssg: boolean, buildId: string, host: string, pathname: string): string {
    const dataRoute = getAssetPathFromRoute(removeTrailingSlash(pathname), ".json");
    return addPathPrefix(`${ssg ? "static" : "dynamic"}/${host}${dataRoute}`, `/_next/data/${buildId}/`);
}
