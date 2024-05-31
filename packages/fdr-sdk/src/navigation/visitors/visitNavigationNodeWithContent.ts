import { assertNever, visitDiscriminatedUnion } from "@fern-ui/core-utils";
import { NavigationNodeWithContent } from "../types/NavigationNode";

type NavigationNodeVisitor<T> = {
    [K in NavigationNodeWithContent["type"]]: (node: Extract<NavigationNodeWithContent, { type: K }>) => T;
};

export function visitNavigationNodeWithContent<T>(
    node: NavigationNodeWithContent,
    visitor: NavigationNodeVisitor<T>,
): T {
    return visitDiscriminatedUnion(node, "type")._visit<T>({
        page: visitor.page,
        section: visitor.section,
        apiReference: visitor.apiReference,
        changelog: visitor.changelog,
        changelogEntry: visitor.changelogEntry,
        endpoint: visitor.endpoint,
        webSocket: visitor.webSocket,
        webhook: visitor.webhook,
        apiSection: visitor.apiSection,
        _other: (other) => assertNever(other as never),
    });
}
