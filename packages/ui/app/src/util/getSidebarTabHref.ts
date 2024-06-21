import { visitDiscriminatedUnion } from "@fern-ui/core-utils";
import { SidebarTab } from "@fern-ui/fdr-utils";
import { slugToHref } from "./slugToHref";

export function getSidebarTabHref(tab: SidebarTab): string {
    const href = visitDiscriminatedUnion(tab, "type")._visit({
        tabGroup: (value) => slugToHref(value.pointsTo ?? value.slug),
        tabLink: (value) => value.url,
        tabChangelog: (value) => slugToHref(value.slug),
        _other: () => "/",
    });
    return href;
}
