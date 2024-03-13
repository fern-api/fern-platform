export declare namespace PlaygroundRequestFormAuth {
    interface BearerAuth {
        type: "bearerAuth";
        token: string;
    }

    interface Header {
        type: "header";
        headers: Record<string, string>;
    }

    interface BasicAuth {
        type: "basicAuth";
        username: string;
        password: string;
    }
}

export type PlaygroundRequestFormAuth =
    | PlaygroundRequestFormAuth.BearerAuth
    | PlaygroundRequestFormAuth.Header
    | PlaygroundRequestFormAuth.BasicAuth;
