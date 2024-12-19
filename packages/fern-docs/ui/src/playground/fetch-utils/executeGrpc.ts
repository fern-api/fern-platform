import urljoin from "url-join";
import { GrpcProxyRequest, ProxyResponse } from "../types";
import { PlaygroundResponse } from "../types/playgroundResponse";

export async function executeGrpc(
  environment: string,
  req: GrpcProxyRequest
): Promise<PlaygroundResponse> {
  // turn this directly into grpc client when cors is figured out
  return fetch(urljoin(environment, "/grpc"), {
    method: "POST",
    body: JSON.stringify({
      baseUrl: req.url,
      endpoint: req.endpointId,
      headers: req.headers,
      body: req.body?.value,
    }),
    mode: "cors",
  }).then(async (res): Promise<PlaygroundResponse> => {
    const proxyResponse = (await res.json()) as ProxyResponse;
    return {
      type: "json",
      ...proxyResponse,
      contentType: res.headers.get("Content-Type") ?? "application/json",
    };
  });
}
