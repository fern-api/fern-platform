import { parseUrl } from "./parse-url";
import { upgradeToWebsocket } from "./websocket";

const REQUEST_HEADERS = "X-Fern-Proxy-Request-Headers";
const RESPONSE_HEADERS = "X-Fern-Proxy-Response-Headers";
const RESPONSE_TIME = "X-Fern-Proxy-Response-Time";
const ORIGIN_LATENCY = "X-Fern-Proxy-Origin-Latency";

export default {
  async fetch(request, _env, _ctx): Promise<Response> {
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "*",
          "Access-Control-Allow-Headers": "*",
        },
      });
    }

    // this url should be: `https://proxy.ferndocs.com/https://<host>/<path>`
    const forwardedUrl = parseUrl(request.url);
    if (forwardedUrl === undefined) {
      return new Response(null, { status: 400 });
    }

    // if the request is a websocket upgrade, we need to handle it specially
    if (request.headers.get("Upgrade") === "websocket") {
      if (
        request.method !== "GET" ||
        !["wss:"].includes(forwardedUrl.protocol)
      ) {
        return new Response(null, { status: 400 });
      }
      return upgradeToWebsocket(forwardedUrl);
    }

    const allowedRequestHeaders = (request.headers.get(REQUEST_HEADERS) ?? "")
      .toLowerCase()
      .split(",");

    const requestHeaders = new Headers();
    requestHeaders.set("User-Agent", "FernDocsProxy");

    // copy over the request headers
    for (const [key, value] of request.headers) {
      if (
        allowedRequestHeaders.length === 0 ||
        allowedRequestHeaders.includes(key.toLowerCase())
      ) {
        requestHeaders.set(key, value);
      }
    }

    // multipart/form-data will be handled by the fetch API with a boundary, and should not be forwarded
    if (
      requestHeaders
        .get("Content-Type")
        ?.toLowerCase()
        .includes("multipart/form-data")
    ) {
      requestHeaders.delete("Content-Type");
    }

    const newRequest = new Request(forwardedUrl, {
      method: request.method,
      headers: requestHeaders,
      body: request.body,
      redirect: "follow",
    });

    const startTime = performance.now();

    // forward the request
    const response = await fetch(newRequest);
    const latency = performance.now() - startTime;

    // copy over the response headers
    const responseHeaders = new Headers([
      ...response.headers,

      // additional proxy headers
      [RESPONSE_HEADERS, [...response.headers.keys()].join(",")],
      [ORIGIN_LATENCY, `${latency}`],
      ["Cache-Control", "no-transform, no-cache"],
    ]);

    // set the response headers (and override cors headers from the original request)
    responseHeaders.set("Access-Control-Allow-Origin", "*");
    responseHeaders.set("Access-Control-Allow-Methods", "*");
    responseHeaders.set("Access-Control-Allow-Headers", "*");
    responseHeaders.set(
      "Access-Control-Expose-Headers",
      [
        RESPONSE_HEADERS.toLowerCase(),
        RESPONSE_TIME.toLowerCase(),
        ORIGIN_LATENCY.toLowerCase(),
        ...response.headers.keys(),
      ].join(", ")
    );

    // detect if the response is a stream, and if so, return it as a stream
    if (
      response.headers.get("Content-Length") == null ||
      response.headers.get("Content-Length") === "0" ||
      response.headers.get("Transfer-Encoding")?.toLowerCase() === "chunked" ||
      response.headers
        .get("Content-Type")
        ?.toLowerCase()
        .startsWith("text/event-stream") ||
      response.headers
        .get("Content-Type")
        ?.toLowerCase()
        .startsWith("application/octet-stream")
    ) {
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
        encodeBody: "manual",
      });
    }

    // otherwise, return the response as a buffer (and measure the time taken)
    const responseBody = await response.arrayBuffer();
    const endTime = performance.now();
    responseHeaders.set(RESPONSE_TIME, `${endTime - startTime}`);

    // return the response as a buffer
    return new Response(responseBody, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
      encodeBody: "manual",
    });
  },
} satisfies ExportedHandler<Env>;
