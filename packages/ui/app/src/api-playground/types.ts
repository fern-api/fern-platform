interface PlaygroundRequestFormAuthBearerAuth {
    type: "bearerAuth";
    token: string;
}

interface PlaygroundRequestFormAuthHeader {
    type: "header";
    headers: Record<string, string>;
}

interface PlaygroundRequestFormBasicAuth {
    type: "basicAuth";
    username: string;
    password: string;
}

export type PlaygroundRequestFormAuth =
    | PlaygroundRequestFormAuthBearerAuth
    | PlaygroundRequestFormAuthHeader
    | PlaygroundRequestFormBasicAuth;

export type PlaygroundRequestFormState = PlaygroundEndpointRequestFormState | PlaygroundWebSocketRequestFormState;

export interface PlaygroundEndpointRequestFormState {
    type: "endpoint";
    auth: PlaygroundRequestFormAuth | undefined;
    headers: Record<string, unknown>;
    pathParameters: Record<string, unknown>;
    queryParameters: Record<string, unknown>;
    body: unknown;
}

export interface PlaygroundWebSocketRequestFormState {
    type: "websocket";
    auth: PlaygroundRequestFormAuth | undefined;
    headers: Record<string, unknown>;
    pathParameters: Record<string, unknown>;
    queryParameters: Record<string, unknown>;
    messages: Record<string, unknown>;
}

export interface ResponsePayload {
    status: number;
    time: number;
    size: string | null;
    body: unknown;
}
