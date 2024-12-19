import { LARGE_LOOP_TOLERANCE } from "./const";
import type * as Latest from "./latest";
import { ApiTypeIdVisitor } from "./typeid-visitor";

export type PruningNodeType =
    | { type: "endpoint"; endpointId: Latest.EndpointId }
    | { type: "webSocket"; webSocketId: Latest.WebSocketId }
    | { type: "webhook"; webhookId: Latest.WebhookId };

class ApiDefinitionPruner {
    static instances = new WeakMap<Latest.ApiDefinition, ApiDefinitionPruner>();

    static from(api: Latest.ApiDefinition): ApiDefinitionPruner {
        const toRet =
            ApiDefinitionPruner.instances.get(api) ??
            new ApiDefinitionPruner(api);
        ApiDefinitionPruner.instances.set(api, toRet);
        return toRet;
    }

    private constructor(private api: Latest.ApiDefinition) {}

    /**
     * This utility is designed to prune an API definition to only include the desired endpoints, websockets, and webhooks
     * based on the provided node of the navigation tree, which will reduce the size of the API definition that is sent to the client.
     *
     * @param node of the navigation tree to prune the API definition to
     * @returns a new API definition that is the result of pruning the input API definition to the desired node
     */
    public prune(...nodes: PruningNodeType[]): Latest.ApiDefinition {
        const toRet: Latest.ApiDefinition = {
            ...this.api,
            endpoints: {},
            websockets: {},
            webhooks: {},
            types: {},
            subpackages: {},
            auths: {},
        };

        const namespaces = new Set<Latest.SubpackageId>();
        const authSchemes = new Set<Latest.AuthSchemeId>();

        for (const node of nodes) {
            if (node.type === "endpoint") {
                const found = this.api.endpoints[node.endpointId];
                if (found) {
                    toRet.endpoints[node.endpointId] = found;
                    found.namespace?.forEach((subpackageId) =>
                        namespaces.add(subpackageId)
                    );
                    found.auth?.forEach((authSchemeId) =>
                        authSchemes.add(authSchemeId)
                    );
                }
            } else if (node.type === "webSocket") {
                const found = this.api.websockets[node.webSocketId];
                if (found) {
                    toRet.websockets[node.webSocketId] = found;
                    found.namespace?.forEach((subpackageId) =>
                        namespaces.add(subpackageId)
                    );
                    found.auth?.forEach((authSchemeId) =>
                        authSchemes.add(authSchemeId)
                    );
                }
            } else if (node.type === "webhook") {
                const found = this.api.webhooks[node.webhookId];
                if (found) {
                    toRet.webhooks[node.webhookId] = found;
                    found.namespace?.forEach((subpackageId) =>
                        namespaces.add(subpackageId)
                    );
                }
            }
        }

        toRet.types = this.pruneTypes(toRet);
        namespaces.forEach((subpackageId) => {
            const subpackage = this.api.subpackages[subpackageId];
            if (subpackage) {
                toRet.subpackages[subpackageId] = subpackage;
            }
        });
        authSchemes.forEach((authSchemeId) => {
            const authScheme = this.api.auths[authSchemeId];
            if (authScheme) {
                toRet.auths[authSchemeId] = authScheme;
            }
        });

        return toRet;
    }

    private pruneTypes(
        partiallyPrunedApi: Latest.ApiDefinition
    ): Record<string, Latest.TypeDefinition> {
        let typeIds = new Set<Latest.TypeId>();
        partiallyPrunedApi.globalHeaders?.forEach((header) => {
            ApiTypeIdVisitor.visitTypeShape(header.valueShape, (typeId) =>
                typeIds.add(typeId)
            );
        });

        for (const endpoint of Object.values(partiallyPrunedApi.endpoints)) {
            ApiTypeIdVisitor.visitEndpointDefinition(endpoint, (typeId) =>
                typeIds.add(typeId)
            );
        }

        for (const websocket of Object.values(partiallyPrunedApi.websockets)) {
            ApiTypeIdVisitor.visitWebSocketChannel(websocket, (typeId) =>
                typeIds.add(typeId)
            );
        }

        for (const webhook of Object.values(partiallyPrunedApi.webhooks)) {
            ApiTypeIdVisitor.visitWebhookDefinition(webhook, (typeId) =>
                typeIds.add(typeId)
            );
        }

        typeIds = this.expandTypeIds(typeIds);

        const types: Record<string, Latest.TypeDefinition> = {};

        typeIds.forEach((typeId) => {
            const type = this.api.types[typeId];
            if (type != null) {
                types[typeId] = type;
            }
        });

        return types;
    }

    private expandTypeIds(
        typeIds: ReadonlySet<Latest.TypeId>
    ): Set<Latest.TypeId> {
        const visitedTypeIds = new Set<Latest.TypeId>();
        const queue = Array.from(typeIds);

        let loop = 0;
        while (queue.length > 0) {
            if (loop > LARGE_LOOP_TOLERANCE + typeIds.size) {
                throw new Error(
                    "Infinite loop detected while expanding type references."
                );
            }

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

            loop++;
        }

        return visitedTypeIds;
    }
}

export function prune(
    api: Latest.ApiDefinition,
    ...nodes: PruningNodeType[]
): Latest.ApiDefinition {
    return ApiDefinitionPruner.from(api).prune(...nodes);
}
