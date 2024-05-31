import { FernNavigation } from "../generated";
import { NavigationNode } from "../types/NavigationNode";
import { visitNavigationNode } from "../visitors";

const RETURN_UNDEFINED = () => undefined;
const RETURN_API_DEFINITION_ID = (node: FernNavigation.WithApiDefinitionId) => node.apiDefinitionId;

export function getApiReferenceId(node: NavigationNode | undefined): FernNavigation.ApiDefinitionId | undefined {
    if (node == null) {
        return undefined;
    }
    return visitNavigationNode(node, {
        root: RETURN_UNDEFINED,
        versioned: RETURN_UNDEFINED,
        tabbed: RETURN_UNDEFINED,
        sidebarRoot: RETURN_UNDEFINED,
        sidebarGroup: RETURN_UNDEFINED,
        version: RETURN_UNDEFINED,
        tab: RETURN_UNDEFINED,
        link: RETURN_UNDEFINED,
        page: RETURN_UNDEFINED,
        section: RETURN_UNDEFINED,
        changelog: RETURN_UNDEFINED,
        changelogYear: RETURN_UNDEFINED,
        changelogMonth: RETURN_UNDEFINED,
        changelogEntry: RETURN_UNDEFINED,

        // api nodes
        apiReference: RETURN_API_DEFINITION_ID,
        endpoint: RETURN_API_DEFINITION_ID,
        endpointPair: (node) => node.nonStream.apiDefinitionId,
        webSocket: RETURN_API_DEFINITION_ID,
        webhook: RETURN_API_DEFINITION_ID,
        apiSection: RETURN_API_DEFINITION_ID,
    });
}
