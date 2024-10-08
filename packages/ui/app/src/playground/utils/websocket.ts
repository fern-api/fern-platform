import type { WebSocketContext } from "@fern-api/fdr-sdk/api-definition";
import { PlaygroundWebSocketRequestFormState } from "../types";
import { getEmptyValueForObjectProperties, getEmptyValueForType } from "./default-values";

export function getInitialWebSocketRequestFormState(context: WebSocketContext): PlaygroundWebSocketRequestFormState {
    return {
        type: "websocket",
        headers: getEmptyValueForObjectProperties(context.channel.requestHeaders, context.types),
        pathParameters: getEmptyValueForObjectProperties(context.channel.pathParameters, context.types),
        queryParameters: getEmptyValueForObjectProperties(context.channel.queryParameters, context.types),
        messages: Object.fromEntries(
            context.channel.messages
                .filter((message) => message.origin === "client")
                .map((message) => [message.type, getEmptyValueForType(message.body, context.types)]) ?? [],
        ),
    };
}
