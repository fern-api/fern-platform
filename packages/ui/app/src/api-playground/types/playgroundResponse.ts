import { ProxyResponse } from "./proxy";

export declare namespace PlaygroundResponse {
    export interface Stream {
        type: "stream";
        response: {
            status: number; // this is mirrored by the proxy
            body: unknown[]; // each chunk of the response
        };
        time: number;
    }

    export interface Json extends ProxyResponse.Success {
        type: "json";
        time: number;
    }
}

export type PlaygroundResponse = PlaygroundResponse.Stream | PlaygroundResponse.Json;
