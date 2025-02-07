import { SnippetHttpRequestBodyFormValue } from "@fern-api/fdr-sdk/api-definition";
import { assertNever } from "@fern-api/ui-core-utils";
import { PlaygroundFormDataEntryValue } from "./formDataEntryValue";
import { JsonVariant } from "./jsonVariant";

export type PlaygroundRequestFormState =
  | PlaygroundEndpointRequestFormState
  | PlaygroundWebSocketRequestFormState;

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
  value: PlaygroundFormDataEntryValue
): SnippetHttpRequestBodyFormValue | undefined {
  switch (value.type) {
    case "file":
      if (value.value == null) {
        return undefined;
      }
      return {
        type: "filename",
        filename: value.value?.name,
        contentType: value.value.type,
      };
    case "fileArray":
      return {
        type: "filenames",
        files: value.value.map((file) => ({
          type: "file",
          filename: file.name,
          contentType: file.type,
        })),
      };
    case "json": {
      return {
        type: "json",
        value: value.value,
      };
    }
    case "exploded": {
      return {
        type: "exploded",
        value: value.value,
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
