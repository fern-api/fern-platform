import { visitDiscriminatedUnion } from "@fern-ui/core-utils";
import { SidebarTab } from "@fern-ui/fdr-utils";
import urljoin from "url-join";

export function getSidebarTabHref(tab: SidebarTab): string {
    return visitDiscriminatedUnion(tab, "type")._visit({
        tabGroup: (value) => urljoin("/", value.slug),
        tabLink: (value) => value.url,
        tabChangelog: (value) => urljoin("/", value.slug),
        _other: () => "/",
    });
}
