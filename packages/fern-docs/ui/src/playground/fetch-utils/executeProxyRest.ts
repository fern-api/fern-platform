import urljoin from "url-join";
import { ProxyRequest } from "../types";
import { PlaygroundResponse } from "../types/playgroundResponse";
import { toBodyInit } from "./requestToBodyInit";

const PROXY_URL = "https://proxy.ferndocs.com/";

export async function executeProxyRest(
  req: ProxyRequest,
  disableProxy: boolean = false,
  domain: string
): Promise<PlaygroundResponse> {
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set(
    "X-Fern-Proxy-Request-Headers",
    Object.keys(req.headers).join(",")
  );

  // multipart/form-data will be handled by the fetch API with a boundary, and should not be forwarded
  if (req.body?.type === "form-data") {
    requestHeaders.delete("Content-Type");
  }

  const res = await fetch(
    disableProxy ? req.url : urljoin(PROXY_URL, req.url),
    {
      method: req.method,
      headers: requestHeaders,
      body: await toBodyInit(req.body, domain),
      mode: "cors",
    }
  );

  const responseHeadersList = (
    res.headers.get("X-Fern-Proxy-Response-Headers") ?? ""
  ).split(",");

  const responseHeaders: Record<string, string> = {};
  responseHeadersList.forEach((header) => {
    if (header) {
      const value = res.headers.get(header);
      if (value != null) {
        responseHeaders[header] = value;
      }
    }
  });

  if (
    res.headers.get("Content-Type")?.toLowerCase()?.includes("application/json")
  ) {
    const startTime = Date.now();
    try {
      const text = await res.text();
      const endTime = Date.now();

      const fallbackTime =
        Number(res.headers.get("X-Fern-Proxy-Origin-Latency") ?? 0) +
        endTime -
        startTime;

      try {
        const json = JSON.parse(text);
        return {
          type: "json",
          response: {
            headers: responseHeaders,
            ok: res.ok,
            redirected: res.redirected,
            status: res.status,
            statusText: res.statusText,
            type: res.type,
            url: res.url,
            body: json,
          },
          contentType: res.headers.get("Content-Type") ?? "application/json",
          time: Number(
            res.headers.get("X-Fern-Proxy-Response-Time") ?? fallbackTime
          ),
          size:
            res.headers.get("Content-Length") ??
            String(new TextEncoder().encode(text).length),
        };
      } catch {
        return {
          type: "string",
          response: {
            headers: responseHeaders,
            ok: res.ok,
            redirected: res.redirected,
            status: res.status,
            statusText: res.statusText,
            type: res.type,
            url: res.url,
            body: text,
          },
          contentType: res.headers.get("Content-Type") ?? "text/plain",
          time: Number(
            res.headers.get("X-Fern-Proxy-Response-Time") ?? fallbackTime
          ),
          size:
            res.headers.get("Content-Length") ??
            String(new TextEncoder().encode(text).length),
        };
      }
    } catch {
      throw new Error("Failed to read response body");
    }
  }

  const startTime = Date.now();
  const blob = await res.blob();
  const endTime = Date.now();

  const fallbackTime =
    Number(res.headers.get("X-Fern-Proxy-Origin-Latency") ?? 0) +
    endTime -
    startTime;

  return {
    type: "file",
    response: {
      headers: responseHeaders,
      ok: res.ok,
      redirected: res.redirected,
      status: res.status,
      statusText: res.statusText,
      type: res.type,
      url: res.url,
      body: URL.createObjectURL(blob),
    },
    contentType: res.headers.get("Content-Type") ?? "application/octet-stream",
    time: Number(res.headers.get("X-Fern-Proxy-Response-Time") ?? fallbackTime),
    size: res.headers.get("Content-Length") ?? String(blob.size),
  };
}
