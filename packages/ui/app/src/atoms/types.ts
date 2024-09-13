import type * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { SidebarTab, SidebarVersionInfo } from "@fern-ui/fdr-utils";
import type { BundledMDX } from "../mdx/types";

export interface NavigationProps {
    currentTabIndex: number | undefined;
    tabs: SidebarTab[];
    currentVersionId: FernNavigation.VersionId | undefined;
    versions: SidebarVersionInfo[];
    sidebar: FernNavigation.SidebarRootNode | undefined;
    trailingSlash: boolean;
}

export interface AnnouncementConfig {
    text: string;
    mdx: BundledMDX;
}
