import { FernNavigation } from "../generated";

/**
 * All possible types of navigation nodes.
 */
export type NavigationNode =
    | FernNavigation.RootNode
    | FernNavigation.VersionedNode
    | FernNavigation.TabbedNode
    | FernNavigation.SidebarRootNode
    | FernNavigation.SidebarGroupNode
    | FernNavigation.VersionNode
    | FernNavigation.TabNode
    | FernNavigation.LinkNode
    | FernNavigation.PageNode
    | FernNavigation.SectionNode
    | FernNavigation.ApiReferenceNode
    | FernNavigation.ChangelogNode
    | FernNavigation.ChangelogYearNode
    | FernNavigation.ChangelogMonthNode
    | FernNavigation.ChangelogEntryNode
    | FernNavigation.EndpointNode
    | FernNavigation.EndpointPairNode
    | FernNavigation.WebSocketNode
    | FernNavigation.WebhookNode
    | FernNavigation.ApiPackageNode;
