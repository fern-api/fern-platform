import { visitDiscriminatedUnion } from "@fern-api/ui-core-utils";
import { slugToHref } from "@fern-docs/utils";
import { SidebarTab } from "@fern-platform/fdr-utils";

export function useSidebarTabHref(tab: SidebarTab): string {
  const href = visitDiscriminatedUnion(tab, "type")._visit({
    tabGroup: (value) => slugToHref(value.pointsTo ?? value.slug),
    tabLink: (value) => value.url,
    tabChangelog: (value) => slugToHref(value.slug),
    _other: () => "/",
  });
  return href;
}
