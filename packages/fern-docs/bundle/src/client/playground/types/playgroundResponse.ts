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

  export interface String {
    type: "string";
    response: ProxyResponse.SerializableBody;
    contentType: string;
    time: number;
    size: string | null;
  }

  export interface Json {
    type: "json";
    response: ProxyResponse.SerializableBody;
    contentType: string;
    time: number;
    size: string | null;
  }

  export interface File {
    type: "file";
    response: ProxyResponse.SerializableFileBody;
    contentType: string;
    time: number;
    size: string | null;
  }
}

export type PlaygroundResponse =
  | PlaygroundResponse.Stream
  | PlaygroundResponse.Json
  | PlaygroundResponse.String
  | PlaygroundResponse.File;
