import urljoin from "url-join";
import { PlaygroundResponse } from "../types/playgroundResponse";
import { ProxyRequest } from "../types/proxy";

export async function executeProxyFile(
  environment: string,
  req: ProxyRequest
): Promise<PlaygroundResponse> {
  const r = await fetch(urljoin(environment, "/file"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(req),
    mode: "cors",
  });

  const contentType =
    r.headers.get("Content-Type") ?? "application/octet-stream";

  if (
    contentType.startsWith("text/") ||
    contentType.startsWith("application/json") ||
    contentType.startsWith("application/javascript") ||
    contentType.startsWith("application/xml")
  ) {
    let body = await r.text();
    try {
      body = JSON.parse(body);
    } catch (e) {
      // ignore
    }
    return {
      type: "json",
      time: 0,
      size: null,
      response: {
        headers: Object.fromEntries(r.headers.entries()),
        ok: r.ok,
        redirected: r.redirected,
        status: r.status,
        statusText: r.statusText,
        type: r.type,
        url: r.url,
        body,
      },
      contentType,
    };
  }

  const body = await r.blob().then((blob) => URL.createObjectURL(blob));
  const contentLength = r.headers.get("Content-Length");

  return {
    type: "file",
    response: {
      headers: Object.fromEntries(r.headers.entries()),
      ok: r.ok,
      redirected: r.redirected,
      status: r.status,
      statusText: r.statusText,
      type: r.type,
      url: r.url,
      body,
    },
    time: 0,
    size: contentLength ?? null,
    contentType,
  };
}
