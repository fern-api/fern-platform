import type { Slug } from "@fern-api/fdr-sdk/navigation";
import { withDefaultProtocol } from "@fern-api/ui-core-utils";
import urlJoin from "url-join";

export function getToHref(
  includeTrailingSlash = false
): (slug: Slug, host?: string) => string {
  return (slug, host) => {
    const path =
      slug === "" ? "/" : includeTrailingSlash ? `/${slug}/` : `/${slug}`;
    if (host == null) {
      return path;
    }
    return urlJoin(withDefaultProtocol(host), path);
  };
}
