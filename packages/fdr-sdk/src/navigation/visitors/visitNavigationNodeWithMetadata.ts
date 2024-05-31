import { assertNever, visitDiscriminatedUnion } from "@fern-ui/core-utils";
import { NavigationNodeWithMetadata } from "../types/NavigationNode";

type NavigationNodeVisitor<T> = {
    [K in NavigationNodeWithMetadata["type"]]: (node: Extract<NavigationNodeWithMetadata, { type: K }>) => T;
};

export function visitNavigationNodeWithMetadata<T>(
    node: NavigationNodeWithMetadata,
    visitor: NavigationNodeVisitor<T>,
): T {
    return visitDiscriminatedUnion(node, "type")._visit<T>({
        version: visitor.version,
        tab: visitor.tab,
        page: visitor.page,
        section: visitor.section,
        apiReference: visitor.apiReference,
        changelog: visitor.changelog,
        changelogYear: visitor.changelogYear,
        changelogMonth: visitor.changelogMonth,
        changelogEntry: visitor.changelogEntry,
        endpoint: visitor.endpoint,
        webSocket: visitor.webSocket,
        webhook: visitor.webhook,
        apiSection: visitor.apiSection,
        root: visitor.root,
        _other: (other) => assertNever(other as never),
    });
}
