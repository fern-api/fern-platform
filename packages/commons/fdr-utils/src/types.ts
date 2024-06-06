import type { DocsV1Read, FernNavigation } from "@fern-api/fdr-sdk";
// import { FlattenedApiDefinition } from "./flattenApiDefinition";

export interface ColorsConfig {
    light: DocsV1Read.ThemeConfig | undefined;
    dark: DocsV1Read.ThemeConfig | undefined;
}

export interface SidebarVersionInfo {
    id: FernNavigation.VersionId;
    title: string;
    slug: FernNavigation.Slug;
    index: number;
    availability: FernNavigation.Availability | undefined;
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
