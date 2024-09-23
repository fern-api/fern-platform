import { ResolvedTypeDefinition, ResolvedWebSocketChannel } from "../../resolver/types";
import { PlaygroundWebSocketRequestFormState } from "../types";
import { getDefaultValueForObjectProperties, getDefaultValueForType } from "./utils";

export function getInitialWebSocketRequestFormState(
    webSocket: ResolvedWebSocketChannel | undefined,
    types: Record<string, ResolvedTypeDefinition>,
): PlaygroundWebSocketRequestFormState {
    return {
        type: "websocket",
        headers: getDefaultValueForObjectProperties(webSocket?.headers, types),
        pathParameters: getDefaultValueForObjectProperties(webSocket?.pathParameters, types),
        queryParameters: getDefaultValueForObjectProperties(webSocket?.queryParameters, types),
        messages: Object.fromEntries(
            webSocket?.messages
                .filter((message) => message.origin === "client")
                .map((message) => [message.type, getDefaultValueForType(message.body, types)]) ?? [],
        ),
    };
}
