import { visitDiscriminatedUnion } from "@fern-api/ui-core-utils";
import { addLeadingSlash } from "@fern-docs/utils";
import { SidebarTab } from "@fern-platform/fdr-utils";

export function useSidebarTabHref(tab: SidebarTab): string {
  const href = visitDiscriminatedUnion(tab, "type")._visit({
    tabGroup: (value) => addLeadingSlash(value.pointsTo ?? value.slug),
    tabLink: (value) => value.url,
    tabChangelog: (value) => addLeadingSlash(value.slug),
    _other: () => "/",
  });
  return href;
}
