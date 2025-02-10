import getAssetPathFromRoute from "next/dist/shared/lib/router/utils/get-asset-path-from-route";

import urlJoin from "url-join";

import { addLeadingSlash, removeTrailingSlash } from "@fern-docs/utils";

export function getPageRoute(
  ssg: boolean,
  domain: string,
  pathname: string
): string {
  const prefix = ssg ? "static" : "dynamic";
  return addLeadingSlash(urlJoin(prefix, domain, pathname));
}

export function getPageRouteMatch(ssg: boolean, buildId: string): string {
  return `/_next/data/${buildId}/${ssg ? "static" : "dynamic"}/[domain]/[[...slug]].json`;
}

export function getNextDataPageRoute(
  ssg: boolean,
  buildId: string,
  domain: string,
  pathname: string
): string {
  pathname = removeTrailingSlash(pathname);
  if (pathname.length === 0 || pathname === "/") {
    pathname = "/index";
  }
  return getNextDataRoutePath(
    buildId,
    addLeadingSlash(
      urlJoin(ssg ? "static" : "dynamic", domain, removeTrailingSlash(pathname))
    )
  );
}

export function getNextDataRoutePath(
  buildId: string,
  pathname: string
): string {
  return `/_next/data/${buildId}${getAssetPathFromRoute(removeTrailingSlash(pathname), ".json")}`;
}
