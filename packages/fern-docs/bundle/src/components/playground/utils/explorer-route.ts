import { addLeadingSlash, removeTrailingSlash } from "@fern-docs/utils";

/**
 * Conforms the slug to the explorer route.
 */
export function conformExplorerRoute(slugOrPathname: string): string {
  return addLeadingSlash(slugOrPathname) + "/~explorer";
}

export function isExplorerRoute(pathname: string): boolean {
  return removeTrailingSlash(pathname).endsWith("/~explorer");
}

export function withoutExplorerRoute(pathname: string): string {
  return pathname.replace("/~explorer", "");
}
