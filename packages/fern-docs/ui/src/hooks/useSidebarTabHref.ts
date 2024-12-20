import { visitDiscriminatedUnion } from "@fern-api/ui-core-utils";
import { SidebarTab } from "@fern-platform/fdr-utils";
import { useToHref } from "./useHref";

export function useSidebarTabHref(tab: SidebarTab): string {
  const toHref = useToHref();
  const href = visitDiscriminatedUnion(tab, "type")._visit({
    tabGroup: (value) => toHref(value.pointsTo ?? value.slug),
    tabLink: (value) => value.url,
    tabChangelog: (value) => toHref(value.slug),
    _other: () => "/",
  });
  return href;
}
