import urljoin from "url-join";
import { Stream } from "../Stream";
import { ProxyRequest } from "../types";

interface ResponseChunk {
    data: string;
    time: number;
}

export function executeProxyStream(environment: string, req: ProxyRequest): Promise<[Response, Stream<ResponseChunk>]> {
    return fetch(urljoin(environment, "/stream"), {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(req),
        mode: "cors",
    }).then(async (response): Promise<[Response, Stream<ResponseChunk>]> => {
        if (response.body == null) {
            throw new Error("Response body is null");
        }
        const stream = new Stream<ResponseChunk>({
            stream: response.body,
            parse: async (i) => {
                const d = i as { data: string; time: number };
                return {
                    data: d.data,
                    time: d.time,
                };
            },
            terminator: "\n",
        });
        return [response, stream];
    });
}
