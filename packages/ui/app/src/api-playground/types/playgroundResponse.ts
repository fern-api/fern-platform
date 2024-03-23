import { ProxyResponse } from "./proxy";

export declare namespace PlaygroundResponse {
    export interface Stream {
        type: "stream";
        response: {
            status: number; // this is mirrored by the proxy
            body: string; // contains all chunks of the response joined by newlines
        };
        time: number;
    }

    export interface Json extends ProxyResponse.Success {
        type: "json";
        time: number;
    }

    export interface File {
        type: "file";
        response: {
            status: number;
            src: string;
            contentType: string;
        };
        time: number;
        size: string | null;
    }
}

export type PlaygroundResponse = PlaygroundResponse.Stream | PlaygroundResponse.Json | PlaygroundResponse.File;
