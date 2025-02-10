import { Atom, useAtomValue } from "jotai";
import urlJoin from "url-join";

import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { withDefaultProtocol } from "@fern-api/ui-core-utils";

import { TRAILING_SLASH_ATOM } from "../atoms";

export function getToHref(
  includeTrailingSlash = false
): (slug: FernNavigation.Slug, host?: string) => string {
  return (slug, host) => {
    const path =
      slug === "" ? "/" : includeTrailingSlash ? `/${slug}/` : `/${slug}`;
    if (host == null) {
      return path;
    }
    return urlJoin(withDefaultProtocol(host), path);
  };
}

export function useToHref(): (slug: FernNavigation.Slug) => string {
  return getToHref(useAtomValue(TRAILING_SLASH_ATOM));
}

export function useHref(slug: FernNavigation.Slug, anchor?: string): string;
export function useHref(
  slug: FernNavigation.Slug | undefined,
  anchor?: string
): string | undefined;
export function useHref(
  slug: FernNavigation.Slug | undefined,
  anchor?: string
): string | undefined {
  const toHref = useToHref();
  if (slug == null) {
    return anchor;
  }
  const pathName = toHref(slug);
  return anchor != null ? `${pathName}#${anchor}` : pathName;
}

export function selectHref(
  get: <T>(atom: Atom<T>) => T,
  slug: FernNavigation.Slug
): string {
  return getToHref(get(TRAILING_SLASH_ATOM))(slug);
}
