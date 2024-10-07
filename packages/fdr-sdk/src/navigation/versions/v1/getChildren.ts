import { UnreachableCaseError } from "ts-essentials";
import { NavigationNode } from "./NavigationNode";
import { isLeaf } from "./NavigationNodeLeaf";

export function getChildren(node: NavigationNode): readonly NavigationNode[] {
    if (isLeaf(node)) {
        return [];
    }

    switch (node.type) {
        case "apiPackage":
        case "changelog":
        case "changelogMonth":
        case "changelogYear":
        case "section":
        case "sidebarGroup":
        case "sidebarRoot":
        case "tabbed":
        case "versioned":
            return node.children;
        case "product":
        case "root":
        case "tab":
            return [node.child];
        case "apiReference":
            return [...node.children, ...(node.changelog ? [node.changelog] : [])];
        case "endpointPair":
            return [node.nonStream, node.stream];
        case "productgroup":
            return [...(node.landingPage ? [node.landingPage] : []), ...node.children];
        case "unversioned":
        case "version":
            return [...(node.landingPage ? [node.landingPage] : []), node.child];
        default:
            throw new UnreachableCaseError(node);
    }
}
