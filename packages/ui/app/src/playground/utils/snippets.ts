import { Snippets } from "@fern-api/fdr-sdk";
import { PlaygroundAuthState, PlaygroundEndpointRequestFormState } from "../types";

export function convertToCustomSnippetPayload(
    formState: PlaygroundEndpointRequestFormState,
    authState: PlaygroundAuthState,
): Snippets.CustomSnippetPayload {
    const auth = toAuthPayload(authState);
    const headers = Object.entries(formState.headers).map(([name, value]) => ({ name, value }));

    // if auth headers is present, and other auth types are not, spread the auth headers into the headers array
    // TODO: verify that this is the correct behavior, and also verify that the user's selection is on header auth.
    if (!auth && authState.header) {
        headers.push(...Object.entries(authState.header.headers).map(([name, value]) => ({ name, value })));
    }

    return {
        pathParameters: Object.entries(formState.pathParameters).map(([name, value]) => ({ name, value })),
        queryParameters: Object.entries(formState.queryParameters).map(([name, value]) => ({ name, value })),

        // should headers use obfuscateSecret?
        headers: Object.entries(formState.headers).map(([name, value]) => ({ name, value })),
        requestBody: formState.body?.value,
        auth,
    };
}

// TODO: this should not be cascading if/else since it should depend on the user's selection and the available auth types for this endpoint
// TODO: obfuscae the secret?
function toAuthPayload(authState: PlaygroundAuthState): Snippets.AuthPayload | undefined {
    if (authState.oauth) {
        return {
            type: "bearer",
            token: authState.oauth.userSuppliedAccessToken || authState.oauth.accessToken,
        };
    } else if (authState.bearerAuth) {
        return {
            type: "bearer",
            token: authState.bearerAuth.token,
        };
    } else if (authState.basicAuth) {
        return {
            type: "basic",
            username: authState.basicAuth.username,
            password: authState.basicAuth.password,
        };
    }
    return undefined;
}
