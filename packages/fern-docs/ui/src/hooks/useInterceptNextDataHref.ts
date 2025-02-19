import { addLeadingSlash, removeTrailingSlash } from "@fern-docs/utils";
import { addLocale } from "next/dist/client/add-locale";
import type PageLoader from "next/dist/client/page-loader";
import { addPathPrefix } from "next/dist/shared/lib/router/utils/add-path-prefix";
import getAssetPathFromRoute from "next/dist/shared/lib/router/utils/get-asset-path-from-route";
import { interpolateAs } from "next/dist/shared/lib/router/utils/interpolate-as";
import { isDynamicRoute } from "next/dist/shared/lib/router/utils/is-dynamic";
import { parseRelativeUrl } from "next/dist/shared/lib/router/utils/parse-relative-url";
import { Router } from "next/router";
import { useEffect } from "react";

/**
 * This function is adapted from https://github.com/vercel/next.js/blob/canary/packages/next/src/client/page-loader.ts
 * It is modified to include a basePath via a parameter, rather than reading it from environment variables.
 */
function createPageLoaderGetDataHref(
  basePath: string | undefined
): PageLoader["getDataHref"] {
  return ({ asPath, href, locale, skipInterpolation }): string => {
    const buildId = window.__NEXT_DATA__.buildId;
    const { pathname: hrefPathname, query, search } = parseRelativeUrl(href);
    const { pathname: asPathname } = parseRelativeUrl(asPath);
    const route = addLeadingSlash(removeTrailingSlash(hrefPathname));

    const indexPrefix = route === "/" ? "index" : undefined;

    const getHrefForSlug = (path: string) => {
      // note: getAsssetPathFromRoute will automatically turn `/` to `/index`
      let dataRoute = getAssetPathFromRoute(
        removeTrailingSlash(addLocale(path, locale)),
        ".json"
      );
      if (indexPrefix != null) {
        dataRoute = `/${indexPrefix}${dataRoute}`;
      }

      // ->> /_next/data/development/index.json
      return addPathPrefix(
        `/_next/data/${buildId}${dataRoute}${search}`,
        basePath
      );
    };

    const toRet = getHrefForSlug(
      skipInterpolation
        ? asPathname
        : isDynamicRoute(route)
          ? interpolateAs(hrefPathname, asPathname, query).result
          : route
    );

    return toRet;
  };
}

// hack for basepath: https://github.com/vercel/next.js/discussions/25681#discussioncomment-2026813
export const useInterceptNextDataHref = ({
  router,
  basePath,
}: {
  router: Router;
  basePath: string | undefined;
}): void => {
  useEffect(() => {
    router.pageLoader.getDataHref = createPageLoaderGetDataHref(basePath);
  }, [router, basePath]);
};
