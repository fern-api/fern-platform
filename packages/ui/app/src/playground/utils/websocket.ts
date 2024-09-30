import { TypeDefinition, WebSocketChannel } from "@fern-api/fdr-sdk/api-definition";
import { PlaygroundWebSocketRequestFormState } from "../types";
import { getEmptyValueForObjectProperties, getEmptyValueForType } from "./default-values";

export function getInitialWebSocketRequestFormState(
    webSocket: WebSocketChannel | undefined,
    types: Record<string, TypeDefinition>,
): PlaygroundWebSocketRequestFormState {
    return {
        type: "websocket",
        headers: getEmptyValueForObjectProperties(webSocket?.requestHeaders, types),
        pathParameters: getEmptyValueForObjectProperties(webSocket?.pathParameters, types),
        queryParameters: getEmptyValueForObjectProperties(webSocket?.queryParameters, types),
        messages: Object.fromEntries(
            webSocket?.messages
                .filter((message) => message.origin === "client")
                .map((message) => [message.type, getEmptyValueForType(message.body, types)]) ?? [],
        ),
    };
}
