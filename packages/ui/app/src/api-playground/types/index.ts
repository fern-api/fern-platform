import { assertNever } from "@fern-ui/core-utils";
import { ResolvedFormValue } from "../../resolver/types";
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
                fileId: undefined,
            };
        case "fileArray":
            return {
                type: "fileArray",
                files: value.value.map((file) => ({ type: "file", fileName: file.name, fileId: undefined })),
            };
        case "json":
            return {
                type: "json",
                value: value.value,
                // TODO: bring in content type from the shape of the form data
                contentType: undefined,
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
