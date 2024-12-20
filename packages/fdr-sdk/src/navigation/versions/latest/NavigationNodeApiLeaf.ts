import type { EndpointNode, WebSocketNode, WebhookNode } from ".";
import type { NavigationNode } from "./NavigationNode";

/**
 * A node in the navigation tree that represents an API endpoint, web socket, or webhook.
 */
export type NavigationNodeApiLeaf = EndpointNode | WebSocketNode | WebhookNode;

export function isApiLeaf(node: NavigationNode): node is NavigationNodeApiLeaf {
    return node.type === "endpoint" || node.type === "webSocket" || node.type === "webhook";
}
