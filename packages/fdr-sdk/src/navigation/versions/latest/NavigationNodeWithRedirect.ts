import type { Exact, MarkRequired } from "ts-essentials";
import type {
    ApiPackageNode,
    ApiReferenceNode,
    ProductNode,
    RootNode,
    SectionNode,
    TabNode,
    VersionNode,
    WithRedirect,
} from ".";
import type { NavigationNode } from "./NavigationNode";

/**
 * Navigation nodes that can have a redirect
 */
export type NavigationNodeWithPointsTo =
    | RootNode
    | ProductNode
    | VersionNode
    | TabNode
    | SectionNode
    | ApiReferenceNode
    | ApiPackageNode;

export function hasPointsTo(node: NavigationNode): node is NavigationNodeWithRedirect {
    return (
        node.type === "root" ||
        node.type === "product" ||
        node.type === "version" ||
        node.type === "tab" ||
        node.type === "section" ||
        node.type === "apiReference" ||
        node.type === "apiPackage"
    );
}

/**
 * Navigation nodes that extend WithRedirect
 */
export type NavigationNodeWithRedirect = Exact<NavigationNodeWithPointsTo, Extract<NavigationNode, WithRedirect>> &
    MarkRequired<WithRedirect, "pointsTo">;

export function hasRedirect(node: NavigationNode): node is NavigationNodeWithRedirect {
    if (!hasPointsTo(node)) {
        return false;
    }
    return node.pointsTo != null;
}
