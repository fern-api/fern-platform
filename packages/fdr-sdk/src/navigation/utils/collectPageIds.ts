import { FernNavigation } from "../generated";
import { NavigationNode } from "../types/NavigationNode";
import { traverseNavigation } from "../visitors/traverseNavigation";
import { getPageId } from "./getPageId";
import { nodeHasContent } from "./nodeHasContent";
import { nodeHasMetadata } from "./nodeHasMetadata";

export function collectPageIds(nav: NavigationNode): Set<FernNavigation.PageId> {
    const pageIds = new Set<FernNavigation.PageId>();
    traverseNavigation(nav, (node) => {
        if (nodeHasMetadata(node) && nodeHasContent(node)) {
            const pageId = getPageId(node);
            if (pageId != null) {
                pageIds.add(pageId);
            }
        }
    });
    return pageIds;
}
