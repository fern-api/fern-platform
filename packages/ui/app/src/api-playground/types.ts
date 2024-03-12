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

export interface JsonVariant {
    type: "json";
    value: unknown;
}

export declare namespace PlaygroundFormStateBody {
    interface FormDataEntryValueFile {
        type: "file";
        value: File | undefined;
    }

    interface FormDataEntryValueFileArray {
        type: "fileArray";
        value: File[];
    }

    interface FormDataEntryValueJson {
        type: "json";
        value: unknown;
    }

    export type FormDataEntryValue = FormDataEntryValueFile | FormDataEntryValueFileArray | FormDataEntryValueJson;

    export interface FormData {
        type: "form-data";
        value: Record<string, FormDataEntryValue>;
    }
}

export type PlaygroundFormStateBody = JsonVariant | PlaygroundFormStateBody.FormData;

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

export declare namespace ProxyRequest {
    interface SerializableFile {
        readonly name: string;
        readonly lastModified: number;
        readonly size: number;
        readonly type: string;
        readonly dataUrl: string; // base64-encoded
    }

    interface SerializableFormDataEntryValueFile {
        type: "file";
        value: SerializableFile | undefined;
    }

    interface SerializableFormDataEntryValueFileArray {
        type: "fileArray";
        value: SerializableFile[];
    }

    type SerializableFormDataEntryValue =
        | JsonVariant
        | SerializableFormDataEntryValueFile
        | SerializableFormDataEntryValueFileArray;

    export interface SerializableFormData {
        type: "form-data";
        value: Record<string, SerializableFormDataEntryValue>;
    }

    export type SerializableBody = JsonVariant | SerializableFormData;
}

export interface ProxyRequest {
    url: string;
    method: string;
    headers: Record<string, string>;
    body: ProxyRequest.SerializableBody | undefined;
}

export declare namespace ProxyResponse {
    export interface SerializableResponse {
        readonly headers: Record<string, string>;
        readonly ok: boolean;
        readonly redirected: boolean;
        readonly status: number;
        readonly statusText: string;
        readonly type: ResponseType;
        readonly url: string;
    }

    export interface SerializableBody extends SerializableResponse {
        readonly body: unknown;
    }

    export interface Error {
        error: true;
        status: number;
        time: number;
        size: string | null;
    }

    export interface Success {
        error: false;
        response: SerializableBody;
        time: number;
        size: string | null;
    }
}

export type ProxyResponse = ProxyResponse.Error | ProxyResponse.Success;
