import * as Latest from "./latest";

/**
 * This utility is designed to join multiple API definitions into a single API definition.
 * After pruning the API definitions server-side to only include the desired endpoints, websockets, and webhooks,
 * this utility can be used to join the pruned API definitions back together on the client-side.
 *
 * @param apis list of API definitions to join (must have the same ID)
 * @returns a new API definition that is the result of joining the input API definitions
 */
export function joiner(
    force = false,
): (first: Latest.ApiDefinition, ...apis: Latest.ApiDefinition[]) => Latest.ApiDefinition {
    return (first, ...apis) => {
        const joined: Latest.ApiDefinition = {
            id: first.id,
            endpoints: { ...first.endpoints },
            websockets: { ...first.websockets },
            webhooks: { ...first.webhooks },
            types: { ...first.types },
            subpackages: { ...first.subpackages },
            auths: { ...first.auths },
            globalHeaders: first.globalHeaders ? [...first.globalHeaders] : undefined,
        };

        let isJoined = false;
        for (const api of apis) {
            if (api.id !== joined.id) {
                throw new Error("Cannot join API definitions with different IDs");
            }

            for (const [endpointId, endpoint] of Object.entries(api.endpoints)) {
                if (!isJoined && !first.endpoints[Latest.EndpointId(endpointId)]) {
                    isJoined = true;
                }
                joined.endpoints[Latest.EndpointId(endpointId)] = endpoint;
            }

            for (const [webSocketId, webSocket] of Object.entries(api.websockets)) {
                if (!isJoined && !first.websockets[Latest.WebSocketId(webSocketId)]) {
                    isJoined = true;
                }
                joined.websockets[Latest.WebSocketId(webSocketId)] = webSocket;
            }

            for (const [webhookId, webhook] of Object.entries(api.webhooks)) {
                if (!isJoined && !first.webhooks[Latest.WebhookId(webhookId)]) {
                    isJoined = true;
                }
                joined.webhooks[Latest.WebhookId(webhookId)] = webhook;
            }

            for (const [typeId, type] of Object.entries(api.types)) {
                if (!isJoined && !first.types[Latest.TypeId(typeId)]) {
                    isJoined = true;
                }
                joined.types[Latest.TypeId(typeId)] = type;
            }

            for (const [subpackageId, subpackage] of Object.entries(api.subpackages)) {
                if (!isJoined && !first.subpackages[Latest.SubpackageId(subpackageId)]) {
                    isJoined = true;
                }
                joined.subpackages[Latest.SubpackageId(subpackageId)] = subpackage;
            }

            for (const [authId, auth] of Object.entries(api.auths)) {
                if (!isJoined && !first.auths[Latest.AuthSchemeId(authId)]) {
                    isJoined = true;
                }
                joined.auths[Latest.AuthSchemeId(authId)] = auth;
            }

            const globalHeaders = (joined.globalHeaders ??= []);
            api.globalHeaders?.forEach((header) => {
                if (!globalHeaders.find((h) => h.key === header.key)) {
                    isJoined = true;
                    globalHeaders.push(header);
                }
            });
        }

        if (!isJoined && !force) {
            return first;
        }

        return joined;
    };
}
