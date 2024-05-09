import { JsonVariant } from "./jsonVariant";
import { SerializableFile, SerializableFormDataEntryValue } from "./serializable";

export declare namespace ProxyRequest {
    export interface SerializableFormData {
        type: "form-data";
        value: Record<string, SerializableFormDataEntryValue>;
        isJsonBlob?: boolean; // this is a hack to allow the API Playground to send JSON blobs in form data
    }

    export interface SerializableOctetStream {
        type: "octet-stream";
        value: SerializableFile | undefined;
    }

    export type SerializableBody = JsonVariant | SerializableFormData | SerializableOctetStream;
}

export interface ProxyRequest {
    url: string;
    method: string;
    headers: Record<string, string>;
    body: ProxyRequest.SerializableBody | undefined;
    stream?: boolean;
    streamTerminator?: string;
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

    export interface SerializableFileBody extends SerializableResponse {
        readonly body: string;
    }
}

export interface ProxyResponse {
    response: ProxyResponse.SerializableBody;
    time: number;
    size: string | null;
}
