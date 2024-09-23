import { FernNavigation } from "../..";
import { isPage } from "../types";
import { NavigationNode } from "../types/NavigationNode";
import { getPageId } from "./getPageId";
import { traverseNavigation } from "./traverseNavigation";

export function collectPageIds(nav: NavigationNode): Set<FernNavigation.PageId> {
    const pageIds = new Set<FernNavigation.PageId>();
    traverseNavigation(nav, (node) => {
        if (isPage(node)) {
            const pageId = getPageId(node);
            if (pageId != null) {
                pageIds.add(pageId);
            }
        }
    });
    return pageIds;
}
