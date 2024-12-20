import * as FernNavigation from "../../../client/generated/api/resources/navigation/resources/v1/types";

/**
 * All possible types of navigation nodes.
 */
export type NavigationNode =
  | FernNavigation.RootNode
  | FernNavigation.ProductGroupNode
  | FernNavigation.VersionedNode
  | FernNavigation.TabbedNode
  | FernNavigation.SidebarRootNode
  | FernNavigation.SidebarGroupNode
  | FernNavigation.ProductNode
  | FernNavigation.VersionNode
  | FernNavigation.UnversionedNode
  | FernNavigation.TabNode
  | FernNavigation.LinkNode
  | FernNavigation.PageNode
  | FernNavigation.LandingPageNode
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
