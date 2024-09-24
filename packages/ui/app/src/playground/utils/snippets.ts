import { Snippets } from "@fern-api/fdr-sdk";
import { PlaygroundEndpointRequestFormState } from "../types";

export function convertToCustomSnippetPayload(
    formState: PlaygroundEndpointRequestFormState,
): Snippets.CustomSnippetPayload {
    return {
        pathParameters: Object.entries(formState.pathParameters).map(([name, value]) => ({ name, value })),
        queryParameters: Object.entries(formState.queryParameters).map(([name, value]) => ({ name, value })),

        // should headers use obfuscateSecret?
        headers: Object.entries(formState.headers).map(([name, value]) => ({ name, value })),
        requestBody: formState.body?.value,
    };
}
