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

export interface PlaygroundRequestFormState {
    auth: PlaygroundRequestFormAuth | undefined;
    headers: Record<string, unknown>;
    pathParameters: Record<string, unknown>;
    queryParameters: Record<string, unknown>;
    body: unknown;
}
