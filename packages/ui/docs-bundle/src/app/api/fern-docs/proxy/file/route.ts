import { buildRequestBody } from "@/pages/api/fern-docs/proxy/rest";
import { getDocsDomainEdge } from "@/server/xfernhost/edge";
import { ProxyRequestSchema } from "@fern-ui/ui";
import { NextRequest, NextResponse } from "next/server";

/**
 * Note: edge functions must return a response within 25 seconds.
 */

export const dynamic = "force-dynamic";

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

        const response = await fetch(proxyRequest.url, {
            method: proxyRequest.method,
            headers: proxyHeaders,
            body: requestBody as BodyInit,
        });

        // Copy all headers from proxied response
        response.headers.forEach((value, name) => {
            headers.set(name, value);
        });

        return new NextResponse(response.body, {
            status: response.status,
            headers,
        });
    } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err);
        return new NextResponse(null, { status: 500 });
    }
}
