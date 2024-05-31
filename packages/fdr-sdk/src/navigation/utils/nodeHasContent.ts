import { NavigationNodeWithContent, NavigationNodeWithMetadata } from "../types/NavigationNode";
import { visitNavigationNodeWithMetadata } from "../visitors/visitNavigationNodeWithMetadata";

const RETURN_TRUE = () => true;
const RETURN_FALSE = () => false;

export function nodeHasContent(node: NavigationNodeWithMetadata): node is NavigationNodeWithContent {
    return visitNavigationNodeWithMetadata(node, {
        root: RETURN_FALSE,
        version: RETURN_FALSE,
        tab: RETURN_FALSE,
        changelogYear: RETURN_FALSE,
        changelogMonth: RETURN_FALSE,

        // These nodes have content
        page: RETURN_TRUE,
        changelogEntry: RETURN_TRUE,
        endpoint: RETURN_TRUE,
        webSocket: RETURN_TRUE,
        webhook: RETURN_TRUE,
        section: (node) => node.overviewPageId != null,
        apiReference: (node) => node.overviewPageId != null,
        changelog: (node) => node.overviewPageId != null,
        apiSection: (node) => node.overviewPageId != null,
    });
}
