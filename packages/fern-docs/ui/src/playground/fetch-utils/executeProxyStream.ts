import urljoin from "url-join";
import { ProxyRequest } from "../types";
import { toBodyInit } from "./requestToBodyInit";

const PROXY_URL = "https://proxy.ferndocs.com/";

export async function executeProxyStream(
  req: ProxyRequest,
  disableProxy: boolean = false,
  domain: string,
): Promise<[Response, ReadableStream<Uint8Array>]> {
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set(
    "X-Fern-Proxy-Request-Headers",
    Object.keys(req.headers).join(",")
  );

  // multipart/form-data will be handled by the fetch API with a boundary, and should not be forwarded
  if (req.body?.type === "form-data") {
    requestHeaders.delete("Content-Type");
  }

  const response = await fetch(
    disableProxy ? req.url : urljoin(PROXY_URL, req.url),
    {
      method: req.method,
      headers: requestHeaders,
      body: await toBodyInit(req.body, domain),
      mode: "cors",
    }
  );

  if (response.body == null) {
    throw new Error("Response body is null");
  }

  return [response, response.body];
}
