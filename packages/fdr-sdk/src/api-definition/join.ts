import * as Latest from "./latest";

/**
 * This utility is designed to join multiple API definitions into a single API definition.
 * After pruning the API definitions server-side to only include the desired endpoints, websockets, and webhooks,
 * this utility can be used to join the pruned API definitions back together on the client-side.
 *
 * @param apis list of API definitions to join (must have the same ID)
 * @returns a new API definition that is the result of joining the input API definitions
 */
export function join(...apis: Latest.ApiDefinition[]): Latest.ApiDefinition {
    const joined: Latest.ApiDefinition = {
        id: apis[0]?.id ?? Latest.ApiDefinitionId(""),
        endpoints: {},
        websockets: {},
        webhooks: {},
        types: {},
        subpackages: {},
        auths: {},
        globalHeaders: undefined,
    };

    for (const api of apis) {
        if (api.id !== joined.id) {
            throw new Error("Cannot join API definitions with different IDs");
        }

        for (const [endpointId, endpoint] of Object.entries(api.endpoints)) {
            joined.endpoints[Latest.EndpointId(endpointId)] = endpoint;
        }

        for (const [webSocketId, webSocket] of Object.entries(api.websockets)) {
            joined.websockets[Latest.WebSocketId(webSocketId)] = webSocket;
        }

        for (const [webhookId, webhook] of Object.entries(api.webhooks)) {
            joined.webhooks[Latest.WebhookId(webhookId)] = webhook;
        }

        for (const [typeId, type] of Object.entries(api.types)) {
            joined.types[Latest.TypeId(typeId)] = type;
        }

        for (const [subpackageId, subpackage] of Object.entries(api.subpackages)) {
            joined.subpackages[Latest.SubpackageId(subpackageId)] = subpackage;
        }

        for (const [authId, auth] of Object.entries(api.auths)) {
            joined.auths[Latest.AuthSchemeId(authId)] = auth;
        }

        const globalHeaders = (joined.globalHeaders ??= []);
        api.globalHeaders?.forEach((header) => {
            if (!globalHeaders.find((h) => h.key === header.key)) {
                globalHeaders.push(header);
            }
        });
    }

    return joined;
}
