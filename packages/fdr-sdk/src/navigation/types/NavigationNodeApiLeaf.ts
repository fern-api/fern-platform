import type { FernNavigation } from "../..";
import type { NavigationNode } from "./NavigationNode";

/**
 * A node in the navigation tree that represents an API endpoint, web socket, or webhook.
 */
export type NavigationNodeApiLeaf =
    | FernNavigation.EndpointNode
    | FernNavigation.WebSocketNode
    | FernNavigation.WebhookNode;

export function isApiLeaf(node: NavigationNode): node is NavigationNodeApiLeaf {
    return node.type === "endpoint" || node.type === "webSocket" || node.type === "webhook";
}
