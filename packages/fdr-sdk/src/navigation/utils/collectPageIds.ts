import { FernNavigation } from "../..";
import { getPageId } from "../versions/latest/getPageId";

export function collectPageIds(
  nav: FernNavigation.NavigationNode
): Set<FernNavigation.PageId> {
  const pageIds = new Set<FernNavigation.PageId>();
  FernNavigation.traverseDF(nav, (node) => {
    if (FernNavigation.isPage(node)) {
      const pageId = getPageId(node);
      if (pageId != null) {
        pageIds.add(pageId);
      }
    }
  });
  return pageIds;
}
