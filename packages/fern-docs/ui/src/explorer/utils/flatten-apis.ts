import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { atom } from "jotai";
import { SIDEBAR_ROOT_NODE_ATOM } from "../../atoms";
import { createBreadcrumbSlicer } from "./breadcrumb";

export interface ApiGroup {
  api: FernNavigation.ApiDefinitionId;
  id: FernNavigation.NodeId;
  breadcrumb: readonly string[];
  items: FernNavigation.NavigationNodeApiLeaf[];
}

const trimBreadcrumbs = createBreadcrumbSlicer<ApiGroup>({
  selectBreadcrumb: (apiGroup) => apiGroup.breadcrumb,
  updateBreadcrumb: (apiGroup, breadcrumb) => ({ ...apiGroup, breadcrumb }),
});

export function flattenApiSection(
  root: FernNavigation.SidebarRootNode | undefined
): ApiGroup[] {
  if (root == null) {
    return [];
  }
  const result: ApiGroup[] = [];
  FernNavigation.traverseDF(root, (node, parents) => {
    if (node.type === "changelog") {
      return "skip";
    }
    if (node.type === "apiReference" || node.type === "apiPackage") {
      // webhooks are not supported in the playground
      const items = node.children
        .filter(FernNavigation.isApiLeaf)
        .filter((item) => item.type !== "webhook");
      if (items.length === 0) {
        return;
      }

      // current node should be included in the breadcrumb
      const breadcrumb = FernNavigation.utils
        .createBreadcrumb([...parents, node])
        .map((breadcrumb) => breadcrumb.title);

      result.push({
        api: node.apiDefinitionId,
        id: node.id,
        breadcrumb,
        items,
      });
    }
    return;
  });

  return trimBreadcrumbs(result);
}

export const PLAYGROUND_API_GROUPS_ATOM = atom((get) => {
  return flattenApiSection(get(SIDEBAR_ROOT_NODE_ATOM));
});
