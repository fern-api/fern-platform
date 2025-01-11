import { withProxyCors } from "@/server/withProxyCors";
import { getDocsDomainEdge, getHostEdge } from "@/server/xfernhost/edge";
import { withDefaultProtocol } from "@fern-api/ui-core-utils";
import { NextRequest, NextResponse } from "next/server";

async function handler(
  req: NextRequest,
  { params }: { params: { endpoint: string[] } }
): Promise<NextResponse> {
  const referrer = withDefaultProtocol(getHostEdge(req));
  const responseHeaders = new Headers(withProxyCors(getDocsDomainEdge(req)));

  // cannot proxy non-https urls
  if (params.endpoint[0] !== "https:") {
    return new NextResponse(null, {
      status: 400,
      headers: responseHeaders,
    });
  }

  const originalUrl = new URL(req.url);

  const forwardedUrl = new URL(
    params.endpoint.join("/").replace(/^https:\/(?!\/)/, "https://"),
    "https://n"
  );

  if (forwardedUrl.host === "n" || forwardedUrl.protocol !== "https:") {
    return new NextResponse(null, {
      status: 400,
      headers: responseHeaders,
    });
  }

  originalUrl.searchParams.forEach((value, key) => {
    forwardedUrl.searchParams.set(key, value);
  });

  const allowedHeaders = (req.headers.get("X-Fern-Proxy-Request-Headers") ?? "")
    .toLowerCase()
    .split(",");

  const requestHeaders = new Headers();
  requestHeaders.set("User-Agent", "FernDocsProxy");

  for (const [key, value] of req.headers) {
    if (allowedHeaders.includes(key.toLowerCase())) {
      requestHeaders.set(key, value);
    }
  }

  const startTime = performance.now();

  const response = await fetch(String(forwardedUrl), {
    method: req.method,
    headers: requestHeaders,
    body: await prepareBody(req),
    redirect: "follow",
    mode: "no-cors",
    priority: "high",
    referrer,
  });

  const endTime = performance.now();

  return new NextResponse(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: new Headers([
      ...responseHeaders,
      ...response.headers,
      ["X-Fern-Proxy-Response-Time", `${endTime - startTime}`],
      ["X-Fern-Proxy-Response-Headers", [...response.headers.keys()].join(",")],
    ]),
  });
}

async function prepareBody(req: NextRequest): Promise<BodyInit | null> {
  if (req.body == null) {
    return null;
  }
  return req.body;

  //   if (req.headers.get("Content-Type")?.includes("multipart/form-data")) {
  //     const formData = new FormData();
  //     const formDataEntries = await req.formData();

  //     for (const [key, value] of formDataEntries.entries()) {
  //       if (value instanceof File) {
  //         console.log(value);

  //         const blob = new Blob([value], { type: value.type });
  //         formData.append(key, blob, value.name);
  //       } else {
  //         formData.append(key, value);
  //       }
  //     }

  //     return formData;
  //   }

  //   const body = await req.json();
  //   return JSON.stringify(body);
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
export const HEAD = handler;
export const OPTIONS = handler;
