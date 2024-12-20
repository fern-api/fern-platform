import urljoin from "url-join";
import { ProxyRequest, ProxyResponse } from "../types";
import { PlaygroundResponse } from "../types/playgroundResponse";

export function executeProxyRest(environment: string, req: ProxyRequest): Promise<PlaygroundResponse> {
    return fetch(urljoin(environment, "/rest"), {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(req),
        mode: "cors",
    }).then(async (res): Promise<PlaygroundResponse> => {
        const proxyResponse = (await res.json()) as ProxyResponse;
        return { type: "json", ...proxyResponse, contentType: res.headers.get("Content-Type") ?? "application/json" };
    });
}
