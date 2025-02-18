import type {
  EndpointNode,
  TypeId,
  WebSocketNode,
  WebhookNode,
} from "../navigation";
import type {
  ApiDefinition,
  AuthScheme,
  EndpointDefinition,
  ObjectProperty,
  TypeDefinition,
  WebSocketChannel,
  WebhookDefinition,
} from "./latest";
import { prune } from "./prune";

export type EndpointContext = {
  node: EndpointNode;
  endpoint: EndpointDefinition;
  globalHeaders: ObjectProperty[];
  auth: AuthScheme | undefined;
  types: Record<TypeId, TypeDefinition>;
};

export function createEndpointContext(
  node: EndpointNode | undefined,
  apiDefinition: ApiDefinition | undefined
): EndpointContext | undefined {
  if (!node) {
    return undefined;
  }
  const api = apiDefinition != null ? prune(apiDefinition, node) : undefined;
  const endpoint = api?.endpoints[node.endpointId];
  if (!endpoint) {
    return undefined;
  }
  return {
    node,
    endpoint,
    auth: endpoint.auth?.map((id) => api.auths[id])[0],
    globalHeaders: api.globalHeaders ?? [],
    types: api.types,
  };
}

export type WebSocketContext = {
  node: WebSocketNode;
  channel: WebSocketChannel;
  globalHeaders: ObjectProperty[];
  auth: AuthScheme | undefined;
  types: Record<TypeId, TypeDefinition>;
};

export function createWebSocketContext(
  node: WebSocketNode | undefined,
  apiDefinition: ApiDefinition | undefined
): WebSocketContext | undefined {
  if (!node) {
    return undefined;
  }
  const api = apiDefinition != null ? prune(apiDefinition, node) : undefined;
  const channel = api?.websockets[node.webSocketId];
  if (!channel) {
    return undefined;
  }
  return {
    node,
    channel,
    auth: channel.auth?.map((id) => api.auths[id])[0],
    globalHeaders: api.globalHeaders ?? [],
    types: api.types,
  };
}

export type WebhookContext = {
  node: WebhookNode;
  webhook: WebhookDefinition;
  types: Record<TypeId, TypeDefinition>;
};

export function createWebhookContext(
  node: WebhookNode | undefined,
  apiDefinition: ApiDefinition | undefined
): WebhookContext | undefined {
  if (!node) {
    return undefined;
  }
  const api = apiDefinition != null ? prune(apiDefinition, node) : undefined;
  const webhook = api?.webhooks[node.webhookId];
  if (!webhook) {
    return undefined;
  }
  return {
    node,
    webhook,
    types: api.types,
  };
}
