import type { DocsV1Read } from "@fern-api/fdr-sdk/client/types";
import type * as FernNavigation from "@fern-api/fdr-sdk/navigation";

export interface ColorsConfig {
    light: DocsV1Read.ThemeConfig | undefined;
    dark: DocsV1Read.ThemeConfig | undefined;
}

export interface VersionSwitcherInfo {
    id: FernNavigation.VersionId;
    title: string;
    slug: FernNavigation.Slug;
    index: number;
    availability: FernNavigation.Availability | undefined;
    pointsTo: FernNavigation.Slug | undefined;
}

interface SidebarTabGroup {
    type: "tabGroup";
    title: string;
    icon: string | undefined;
    index: number;
    slug: FernNavigation.Slug;
    pointsTo: FernNavigation.Slug | undefined;
}

interface SidebarTabLink {
    type: "tabLink";
    title: string;
    icon: string | undefined;
    index: number;
    url: string;
}

interface SidebarTabChangelog {
    type: "tabChangelog";
    title: string;
    icon: string | undefined;
    index: number;
    slug: FernNavigation.Slug;
}

export type SidebarTab = SidebarTabGroup | SidebarTabLink | SidebarTabChangelog;
