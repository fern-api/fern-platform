import type { APIV1Read } from "../client/types";
import type { FernNavigation } from "./..";
import { ApiDefinitionHolder } from "./ApiDefinitionHolder";
import { ApiTypeIdVisitor } from "./ApiTypeIdVisitor";

export class ApiDefinitionPruner {
    constructor(private api: APIV1Read.ApiDefinition) {}

    public prune(
        node:
            | FernNavigation.NavigationNodeApiLeaf
            | FernNavigation.EndpointPairNode
    ): APIV1Read.ApiDefinition {
        const rootPackage = this.pruneRootPackage(node);
        const subpackages = this.pruneSubpackages(node);
        const types = this.pruneTypes(
            rootPackage,
            subpackages,
            this.api.globalHeaders
        );

        return {
            id: this.api.id,
            rootPackage,
            subpackages,
            types,
            auth: this.api.auth,
            hasMultipleBaseUrls: this.api.hasMultipleBaseUrls,
            navigation: undefined,
            globalHeaders: this.api.globalHeaders,
        };
    }

    private pruneTypes(
        rootPackage: APIV1Read.ApiDefinitionPackage,
        subpackages: Record<string, APIV1Read.ApiDefinitionSubpackage>,
        globalHeaders: APIV1Read.Header[] | undefined
    ): Record<string, APIV1Read.TypeDefinition> {
        let typeIds = new Set<APIV1Read.TypeId>();
        globalHeaders?.forEach((header) => {
            ApiTypeIdVisitor.visitTypeReference(header.type, (typeId) =>
                typeIds.add(typeId)
            );
        });
        typeIds = this.expandTypeIds(typeIds);

        [rootPackage, ...Object.values(subpackages)].forEach((subpackage) => {
            subpackage.types.forEach((typeId) => typeIds.add(typeId));
        });

        const types: Record<string, APIV1Read.TypeDefinition> = {};

        typeIds.forEach((typeId) => {
            const type = this.api.types[typeId];
            if (type != null) {
                types[typeId] = type;
            }
        });

        return types;
    }

    private expandTypeIds(
        typeIds: Set<APIV1Read.TypeId>
    ): Set<APIV1Read.TypeId> {
        const visitedTypeIds = new Set<APIV1Read.TypeId>();
        const queue = Array.from(typeIds);

        while (queue.length > 0) {
            const typeId = queue.pop();
            if (typeId != null && !visitedTypeIds.has(typeId)) {
                visitedTypeIds.add(typeId);
                const type = this.api.types[typeId];
                if (type) {
                    ApiTypeIdVisitor.visitTypeDefinition(
                        type,
                        (nestedTypeId) => {
                            queue.push(nestedTypeId);
                        }
                    );
                }
            }
        }

        return visitedTypeIds;
    }

    private pruneRootPackage(
        node:
            | FernNavigation.NavigationNodeApiLeaf
            | FernNavigation.EndpointPairNode
    ): APIV1Read.ApiDefinitionPackage {
        return this.prunePackage(node, this.api.rootPackage);
    }

    private pruneSubpackages(
        node:
            | FernNavigation.NavigationNodeApiLeaf
            | FernNavigation.EndpointPairNode
    ): Record<string, APIV1Read.ApiDefinitionSubpackage> {
        const subpackages: Record<string, APIV1Read.ApiDefinitionSubpackage> =
            {};

        for (const [subpackageId, subpackage] of Object.entries(
            this.api.subpackages
        )) {
            subpackages[subpackageId] = this.prunePackage(
                node,
                subpackage,
                subpackageId
            );
        }

        return subpackages;
    }

    private prunePackage<T extends APIV1Read.ApiDefinitionPackage>(
        node:
            | FernNavigation.NavigationNodeApiLeaf
            | FernNavigation.EndpointPairNode,
        pkg: T,
        subpackageId?: string
    ): T {
        const endpoints = this.pruneEndpoints(
            node,
            pkg.endpoints,
            subpackageId
        );
        const websockets = this.pruneWebSockets(
            node,
            pkg.websockets,
            subpackageId
        );
        const webhooks = this.pruneWebhooks(node, pkg.webhooks, subpackageId);
        const typeIds = new Set<APIV1Read.TypeId>();
        endpoints.forEach((endpoint) => {
            ApiTypeIdVisitor.visitEndpointDefinition(endpoint, (typeId) =>
                typeIds.add(typeId)
            );
        });
        websockets.forEach((websocket) => {
            ApiTypeIdVisitor.visitWebSocketChannel(websocket, (typeId) =>
                typeIds.add(typeId)
            );
        });
        webhooks.forEach((webhook) => {
            ApiTypeIdVisitor.visitWebhookDefinition(webhook, (typeId) =>
                typeIds.add(typeId)
            );
        });
        const expandedTypeIds = this.expandTypeIds(typeIds);
        return {
            ...pkg,
            endpoints,
            websockets,
            webhooks,
            types: Array.from(expandedTypeIds),
        };
    }

    private pruneEndpoints(
        node:
            | FernNavigation.NavigationNodeApiLeaf
            | FernNavigation.EndpointPairNode,
        endpoints: APIV1Read.EndpointDefinition[],
        subpackageId?: string
    ): APIV1Read.EndpointDefinition[] {
        if (node.type !== "endpoint" && node.type !== "endpointPair") {
            return [];
        }

        if (node.type === "endpointPair") {
            return [
                ...this.pruneEndpoints(node.stream, endpoints, subpackageId),
                ...this.pruneEndpoints(node.nonStream, endpoints, subpackageId),
            ];
        }

        const endpointId = node.endpointId;
        const found = endpoints.find(
            (endpoint) =>
                ApiDefinitionHolder.createEndpointId(endpoint, subpackageId) ===
                endpointId
        );

        return found ? [found] : [];
    }

    private pruneWebSockets(
        node:
            | FernNavigation.NavigationNodeApiLeaf
            | FernNavigation.EndpointPairNode,
        websockets: APIV1Read.WebSocketChannel[],
        subpackageId?: string
    ): APIV1Read.WebSocketChannel[] {
        if (node.type !== "webSocket") {
            return [];
        }

        const websocketId = node.webSocketId;
        const found = websockets.find(
            (websocket) =>
                ApiDefinitionHolder.createWebSocketId(
                    websocket,
                    subpackageId
                ) === websocketId
        );

        return found ? [found] : [];
    }

    private pruneWebhooks(
        node:
            | FernNavigation.NavigationNodeApiLeaf
            | FernNavigation.EndpointPairNode,
        webhooks: APIV1Read.WebhookDefinition[],
        subpackageId?: string
    ): APIV1Read.WebhookDefinition[] {
        if (node.type !== "webhook") {
            return [];
        }

        const webhookId = node.webhookId;
        const found = webhooks.find(
            (webhook) =>
                ApiDefinitionHolder.createWebhookId(webhook, subpackageId) ===
                webhookId
        );

        return found ? [found] : [];
    }
}
