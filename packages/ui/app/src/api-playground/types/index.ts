import { assertNever } from "@fern-ui/core-utils";
import { compact } from "lodash-es";
import { ResolvedFormDataRequestProperty, ResolvedFormValue } from "../../resolver/types";
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
    property: ResolvedFormDataRequestProperty | undefined,
    domain: string,
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
                contentType: value.value.type,
            };
        case "fileArray":
            return {
                type: "fileArray",
                files: value.value.map((file) => ({
                    type: "file",
                    fileName: file.name,
                    fileId: undefined,
                    contentType: file.type,
                })),
            };
        case "json": {
            const contentType = property?.type === "bodyProperty" ? compact(property.contentType)[0] : undefined;
            return {
                type: "json",
                value: value.value,
                // this is a hack to allow the API Playground to send JSON blobs in form data
                // revert this once we have a better solution
                contentType: contentType ?? (domain.includes("fileforge") ? "application/json" : undefined),
            };
        }
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
    headers: Record<string, unknown>;
    pathParameters: Record<string, unknown>;
    queryParameters: Record<string, unknown>;
    body: PlaygroundFormStateBody | undefined;
}

export interface PlaygroundWebSocketRequestFormState {
    type: "websocket";
    headers: Record<string, unknown>;
    pathParameters: Record<string, unknown>;
    queryParameters: Record<string, unknown>;
    messages: Record<string, unknown>;
}

export * from "./auth";
export * from "./formDataEntryValue";
export * from "./proxy";
export * from "./serializable";
