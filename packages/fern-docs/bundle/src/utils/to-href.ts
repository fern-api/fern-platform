import type { Slug } from "@fern-api/fdr-sdk/navigation";
import { isTrailingSlashEnabled } from "@fern-docs/utils";
import "server-only";
import { getToHref } from "./get-to-href";

export function toHref(slug: Slug, host?: string): string {
  return getToHref(isTrailingSlashEnabled())(slug, host);
}
