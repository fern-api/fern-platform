import urljoin from "url-join";
import { ProxyRequest } from "../types";
import { toBodyInit } from "./requestToBodyInit";

const PROXY_URL = "https://proxy.ferndocs.com/";

export async function executeProxyStream(
  req: ProxyRequest
): Promise<[Response, ReadableStream<Uint8Array>]> {
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set(
    "X-Fern-Proxy-Request-Headers",
    Object.keys(req.headers).join(",")
  );

  const response = await fetch(urljoin(PROXY_URL, req.url), {
    method: req.method,
    headers: requestHeaders,
    body: await toBodyInit(req.body),
    mode: "cors",
  });

  if (response.body == null) {
    throw new Error("Response body is null");
  }

  return [response, response.body];
}
