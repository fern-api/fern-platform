import { NavigationNode, NavigationNodeWithMetadata } from "../types/NavigationNode";
import { visitNavigationNode } from "../visitors/visitNavigationNode";

const RETURN_FALSE = () => false;
const RETURN_TRUE = () => true;

export function nodeHasMetadata(node: NavigationNode): node is NavigationNodeWithMetadata {
    return visitNavigationNode(node, {
        versioned: RETURN_FALSE,
        tabbed: RETURN_FALSE,
        sidebarRoot: RETURN_FALSE,
        link: RETURN_FALSE,
        endpointPair: RETURN_FALSE,

        // The following nodes have metadata
        root: RETURN_TRUE,
        version: RETURN_TRUE,
        tab: RETURN_TRUE,
        page: RETURN_TRUE,
        section: RETURN_TRUE,
        apiReference: RETURN_TRUE,
        changelog: RETURN_TRUE,
        changelogYear: RETURN_TRUE,
        changelogMonth: RETURN_TRUE,
        changelogEntry: RETURN_TRUE,
        endpoint: RETURN_TRUE,
        webSocket: RETURN_TRUE,
        webhook: RETURN_TRUE,
        apiSection: RETURN_TRUE,
    });
}
