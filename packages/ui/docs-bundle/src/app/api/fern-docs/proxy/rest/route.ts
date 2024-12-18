import { buildRequestBody } from "@/server/buildRequestBody";
import { getDocsDomainEdge } from "@/server/xfernhost/edge";
import { ProxyRequestSchema } from "@fern-ui/ui";
import { NextRequest, NextResponse } from "next/server";

/**
 * Note: edge functions must return a response within 25 seconds.
 */

export const runtime = "edge";

export async function OPTIONS(req: NextRequest): Promise<NextResponse> {
    const origin = getDocsDomainEdge(req);

    const headers = new Headers({
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Methods": "POST",
        "Access-Control-Allow-Headers": "Content-Type",
    });

    return new NextResponse(null, { status: 204, headers });
}

export async function POST(req: NextRequest): Promise<NextResponse> {
    const origin = getDocsDomainEdge(req);

    const headers = new Headers({
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Methods": "POST",
        "Access-Control-Allow-Headers": "Content-Type",
    });

    // eslint-disable-next-line no-console
    console.log("Starting proxy request to", req.url);

    try {
        const body = await req.json();
        const proxyRequest = ProxyRequestSchema.parse(body);
        const [mime, requestBody] = await buildRequestBody(proxyRequest.body);
        const proxyHeaders = new Headers(proxyRequest.headers);

        // omit content-type for multipart/form-data so that fetch can set it automatically with the boundary
        const contentType = proxyHeaders.get("Content-Type");
        if (contentType != null && contentType.toLowerCase().includes("multipart/form-data")) {
            proxyHeaders.delete("Content-Type");
        } else if (mime != null) {
            proxyHeaders.set("Content-Type", mime);
        }

        const startTime = Date.now();

        const response = await fetch(proxyRequest.url, {
            method: proxyRequest.method,
            headers: proxyHeaders,
            body: requestBody,
        });

        // eslint-disable-next-line no-console
        console.log("Proxy request to", req.url, "completed with status", response.status);

        let responseBody = await response.text();
        const endTime = Date.now();

        // eslint-disable-next-line no-console
        console.log("Proxy request to", req.url, "received response body after", endTime - startTime, "milliseconds");

        try {
            responseBody = JSON.parse(responseBody);
        } catch (e) {
            // eslint-disable-next-line no-console
            console.log("Failed to parse response body as JSON, but will return it as text.");
            // eslint-disable-next-line no-console
            console.error(e);
        }

        response.headers.forEach((value, name) => {
            headers.set(name, value);
        });

        return new NextResponse(
            JSON.stringify({
                response: {
                    headers: Object.fromEntries(response.headers.entries()),
                    ok: response.ok,
                    redirected: response.redirected,
                    status: response.status,
                    statusText: response.statusText,
                    type: response.type,
                    url: response.url,
                    body: responseBody,
                },
                time: endTime - startTime,
                size: response.headers.get("Content-Length"),
            }),
            {
                status: 200,
                headers,
            },
        );
    } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err);
        return new NextResponse(null, { status: 500 });
    }
}
