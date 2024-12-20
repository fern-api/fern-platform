import type { APIV1Read } from "../client/types";
import { ROOT_PACKAGE_ID } from "./consts";
import { isSubpackage } from "./utils/isSubpackage";
import * as FernNavigation from "./versions/latest";

export class ApiDefinitionHolder {
    public static create(api: APIV1Read.ApiDefinition): ApiDefinitionHolder {
        return new ApiDefinitionHolder(api);
    }

    #endpoints = new Map<FernNavigation.EndpointId, APIV1Read.EndpointDefinition>();
    #webSockets = new Map<FernNavigation.WebSocketId, APIV1Read.WebSocketChannel>();
    #webhooks = new Map<FernNavigation.WebhookId, APIV1Read.WebhookDefinition>();

    private constructor(public readonly api: APIV1Read.ApiDefinition) {
        [api.rootPackage, ...Object.values(api.subpackages)].forEach((package_) => {
            const subpackageId = isSubpackage(package_) ? package_.subpackageId : ROOT_PACKAGE_ID;
            package_.endpoints.forEach((endpoint) => {
                this.#endpoints.set(ApiDefinitionHolder.createEndpointId(endpoint, subpackageId), endpoint);
            });
            package_.websockets.forEach((webSocket) => {
                this.#webSockets.set(ApiDefinitionHolder.createWebSocketId(webSocket, subpackageId), webSocket);
            });
            package_.webhooks.forEach((webhook) => {
                this.#webhooks.set(ApiDefinitionHolder.createWebhookId(webhook, subpackageId), webhook);
            });
        });
    }

    get endpoints(): ReadonlyMap<FernNavigation.EndpointId, APIV1Read.EndpointDefinition> {
        return this.#endpoints;
    }

    get webSockets(): ReadonlyMap<FernNavigation.WebSocketId, APIV1Read.WebSocketChannel> {
        return this.#webSockets;
    }

    get webhooks(): ReadonlyMap<FernNavigation.WebhookId, APIV1Read.WebhookDefinition> {
        return this.#webhooks;
    }

    public static createEndpointId(
        endpoint: APIV1Read.EndpointDefinition,
        subpackageId: string = ROOT_PACKAGE_ID,
    ): FernNavigation.EndpointId {
        return FernNavigation.EndpointId(endpoint.originalEndpointId ?? `${subpackageId}.${endpoint.id}`);
    }

    public static createWebSocketId(
        webSocket: APIV1Read.WebSocketChannel,
        subpackageId: string = ROOT_PACKAGE_ID,
    ): FernNavigation.WebSocketId {
        return FernNavigation.WebSocketId(`${subpackageId}.${webSocket.id}`);
    }

    public static createWebhookId(
        webhook: APIV1Read.WebhookDefinition,
        subpackageId: string = ROOT_PACKAGE_ID,
    ): FernNavigation.WebhookId {
        return FernNavigation.WebhookId(`${subpackageId}.${webhook.id}`);
    }
}
