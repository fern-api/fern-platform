import { FernNavigation } from "../generated";
import { NavigationNode } from "../types/NavigationNode";
import { visitNavigationNodeWithContent } from "../visitors/visitNavigationNodeWithContent";
import { nodeHasContent } from "./nodeHasContent";
import { nodeHasMetadata } from "./nodeHasMetadata";

const RETURN_PAGEID = (node: { pageId: FernNavigation.PageId }) => node.pageId;
const RETURN_OVERVIEW_PAGEID = (node: { overviewPageId: FernNavigation.PageId }) => node.overviewPageId;
const RETURN_UNDEFINED = () => undefined;

export function getPageId(node: NavigationNode): FernNavigation.PageId | undefined {
    if (nodeHasMetadata(node) && nodeHasContent(node)) {
        return visitNavigationNodeWithContent(node, {
            section: RETURN_OVERVIEW_PAGEID,
            apiReference: RETURN_OVERVIEW_PAGEID,
            changelog: RETURN_OVERVIEW_PAGEID,
            apiSection: RETURN_OVERVIEW_PAGEID,
            changelogEntry: RETURN_PAGEID,
            page: RETURN_PAGEID,
            endpoint: RETURN_UNDEFINED,
            webSocket: RETURN_UNDEFINED,
            webhook: RETURN_UNDEFINED,
        });
    }
    return;
}
