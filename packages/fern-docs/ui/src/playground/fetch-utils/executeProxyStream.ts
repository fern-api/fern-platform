import urljoin from "url-join";
import { ProxyRequest } from "../types";
import { toBodyInit } from "./requestToBodyInit";

const PROXY_URL = "https://proxy.ferndocs.com/";

// interface ResponseChunk {
//   data: string;
//   time: number;
// }

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
    body: toBodyInit(req.body),
    mode: "cors",
  });

  if (response.body == null) {
    throw new Error("Response body is null");
  }

  // const stream = new Stream<ResponseChunk>({
  //   stream: response.body,
  //   parse: async (i_1) => {
  //     const d = i_1 as { data: string; time: number };
  //     return {
  //       data: d.data,
  //       time: d.time,
  //     };
  //   },
  //   terminator: "\n",
  // });

  return [response, response.body];
}
