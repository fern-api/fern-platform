import visitDiscriminatedUnion from "@fern-api/ui-core-utils/visitDiscriminatedUnion";
import { FernNavigation } from "../..";

const RETURN_UNDEFINED = () => undefined;
const RETURN_API_DEFINITION_ID = (node: FernNavigation.WithApiDefinitionId) =>
    node.apiDefinitionId;

export function getApiReferenceId(
    node: FernNavigation.NavigationNode | undefined
): FernNavigation.ApiDefinitionId | undefined {
    if (node == null) {
        return undefined;
    }
    return visitDiscriminatedUnion(node)._visit({
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
        product: RETURN_UNDEFINED,
        productgroup: RETURN_UNDEFINED,

        // api nodes
        apiReference: RETURN_API_DEFINITION_ID,
        endpoint: RETURN_API_DEFINITION_ID,
        endpointPair: (node) => node.nonStream.apiDefinitionId,
        webSocket: RETURN_API_DEFINITION_ID,
        webhook: RETURN_API_DEFINITION_ID,
        apiPackage: RETURN_API_DEFINITION_ID,
        unversioned: RETURN_UNDEFINED,
        landingPage: RETURN_UNDEFINED,
    });
}
