import type { APIV1Read, APIV1UI } from "../client/types";
import type { FernNavigation } from "../navigation/generated";
import type { NavigationNodeApiLeaf } from "../navigation/types";
import { ApiTypeIdVisitor } from "./ApiTypeIdVisitor";

export class ApiDefinitionPruner {
    constructor(private api: APIV1UI.ApiDefinition) {}

    public prune(node: NavigationNodeApiLeaf | FernNavigation.EndpointPairNode): APIV1UI.ApiDefinition {
        const toRet: APIV1UI.ApiDefinition = {
            ...this.api,
            endpoints: {},
            websockets: {},
            webhooks: {},
        };

        if (node.type === "endpoint") {
            const found = this.api.endpoints[node.id];
            if (found) {
                toRet.endpoints[node.id] = found;
            }
        } else if (node.type === "endpointPair") {
            const stream = this.api.endpoints[node.stream.id];
            if (stream) {
                toRet.endpoints[node.stream.id] = stream;
            }
            const nonStream = this.api.endpoints[node.nonStream.id];
            if (nonStream) {
                toRet.endpoints[node.nonStream.id] = nonStream;
            }
        } else if (node.type === "webSocket") {
            const found = this.api.websockets[node.id];
            if (found) {
                toRet.websockets[node.id] = found;
            }
        } else if (node.type === "webhook") {
            const found = this.api.webhooks[node.id];
            if (found) {
                toRet.webhooks[node.id] = found;
            }
        }

        toRet.types = this.pruneTypes(toRet);

        return toRet;
    }

    private pruneTypes(partiallyPrunedApi: APIV1UI.ApiDefinition): Record<string, APIV1UI.TypeDefinition> {
        let typeIds = new Set<APIV1UI.TypeId>();
        partiallyPrunedApi.globalHeaders?.forEach((header) => {
            ApiTypeIdVisitor.visitTypeReference(header.valueShape, (typeId) => typeIds.add(typeId));
        });

        for (const endpoint of Object.values(partiallyPrunedApi.endpoints)) {
            ApiTypeIdVisitor.visitEndpointDefinition(endpoint, (typeId) => typeIds.add(typeId));
        }

        for (const websocket of Object.values(partiallyPrunedApi.websockets)) {
            ApiTypeIdVisitor.visitWebSocketChannel(websocket, (typeId) => typeIds.add(typeId));
        }

        for (const webhook of Object.values(partiallyPrunedApi.webhooks)) {
            ApiTypeIdVisitor.visitWebhookDefinition(webhook, (typeId) => typeIds.add(typeId));
        }

        typeIds = this.expandTypeIds(typeIds);

        const types: Record<string, APIV1UI.TypeDefinition> = {};

        typeIds.forEach((typeId) => {
            const type = this.api.types[typeId];
            if (type != null) {
                types[typeId] = type;
            }
        });

        return types;
    }

    private expandTypeIds(typeIds: Set<APIV1Read.TypeId>): Set<APIV1Read.TypeId> {
        const visitedTypeIds = new Set<APIV1Read.TypeId>();
        const queue = Array.from(typeIds);

        while (queue.length > 0) {
            const typeId = queue.pop();
            if (typeId != null && !visitedTypeIds.has(typeId)) {
                visitedTypeIds.add(typeId);
                const type = this.api.types[typeId];
                if (type) {
                    ApiTypeIdVisitor.visitTypeDefinition(type, (nestedTypeId) => {
                        queue.push(nestedTypeId);
                    });
                }
            }
        }

        return visitedTypeIds;
    }
}
