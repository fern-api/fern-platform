import { assertNever, visitDiscriminatedUnion } from "@fern-ui/core-utils";
import { NavigationNode } from "../types/NavigationNode";

type NavigationNodeVisitor<T> = {
    [K in NavigationNode["type"]]: (node: Extract<NavigationNode, { type: K }>) => T;
};

export function visitNavigationNode<T>(node: NavigationNode, visitor: NavigationNodeVisitor<T>): T {
    return visitDiscriminatedUnion(node, "type")._visit<T>({
        root: visitor.root,
        versioned: visitor.versioned,
        tabbed: visitor.tabbed,
        sidebarRoot: visitor.sidebarRoot,
        version: visitor.version,
        tab: visitor.tab,
        link: visitor.link,
        page: visitor.page,
        section: visitor.section,
        apiReference: visitor.apiReference,
        changelog: visitor.changelog,
        changelogYear: visitor.changelogYear,
        changelogMonth: visitor.changelogMonth,
        changelogEntry: visitor.changelogEntry,
        endpoint: visitor.endpoint,
        endpointPair: visitor.endpointPair,
        webSocket: visitor.webSocket,
        webhook: visitor.webhook,
        apiSection: visitor.apiSection,
        _other: (other) => assertNever(other as never),
    });
}
