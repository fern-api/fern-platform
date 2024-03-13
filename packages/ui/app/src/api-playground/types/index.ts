import { assertNever } from "@fern-ui/core-utils";
import { ResolvedFormValue } from "../../util/resolver";
import { PlaygroundRequestFormAuth } from "./auth";
import { PlaygroundFormDataEntryValue } from "./formDataEntryValue";
import { JsonVariant } from "./jsonVariant";

export type PlaygroundRequestFormState = PlaygroundEndpointRequestFormState | PlaygroundWebSocketRequestFormState;

export declare namespace PlaygroundFormStateBody {
    export interface FormData {
        type: "form-data";
        value: Record<string, PlaygroundFormDataEntryValue>;
    }

    export interface OctetStream {
        type: "octet-stream";
        value: File | undefined;
    }
}

export function convertPlaygroundFormDataEntryValueToResolvedExampleEndpointRequest(
    value: PlaygroundFormDataEntryValue,
): ResolvedFormValue | undefined {
    switch (value.type) {
        case "file":
            if (value.value == null) {
                return undefined;
            }
            return {
                type: "file",
                fileName: value.value?.name,
            };
        case "fileArray":
            return {
                type: "fileArray",
                fileNames: value.value.map((file) => file.name),
            };
        case "json":
            return {
                type: "json",
                value: value.value,
            };
        default:
            assertNever(value);
    }
}

export type PlaygroundFormStateBody =
    | JsonVariant
    | PlaygroundFormStateBody.FormData
    | PlaygroundFormStateBody.OctetStream;

export interface PlaygroundEndpointRequestFormState {
    type: "endpoint";
    auth: PlaygroundRequestFormAuth | undefined;
    headers: Record<string, unknown>;
    pathParameters: Record<string, unknown>;
    queryParameters: Record<string, unknown>;
    body: PlaygroundFormStateBody | undefined;
}

export interface PlaygroundWebSocketRequestFormState {
    type: "websocket";
    auth: PlaygroundRequestFormAuth | undefined;
    headers: Record<string, unknown>;
    pathParameters: Record<string, unknown>;
    queryParameters: Record<string, unknown>;
    messages: Record<string, unknown>;
}

export * from "./auth";
export * from "./formDataEntryValue";
export * from "./proxy";
export * from "./serializable";
