import { ProxyRequestSchema } from "@fern-ui/ui";
import { NextRequest, NextResponse } from "next/server";
import { buildRequestBody } from "./rest";

/**
 * Note: edge functions must return a response within 25 seconds.
 *
 * This function is used to return the response directly from the proxied request, and is useful for file downloads.
 *
 * TODO: this should be rewritten as a node.js serverless function to avoid the 25 second limit, since file downloads can take a much longer time.
 */

export const runtime = "edge";
export const dynamic = "force-dynamic";

export default async function POST(req: NextRequest): Promise<NextResponse<null | Uint8Array>> {
    if (req.method !== "POST" && req.method !== "OPTIONS") {
        return new NextResponse(null, { status: 405 });
    }

    const origin = req.headers.get("Origin");
    if (origin == null) {
        return new NextResponse(null, { status: 400 });
    }

    const corsHeaders = {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Methods": "POST",
        "Access-Control-Allow-Headers": "Content-Type",
    };

    if (req.method === "OPTIONS") {
        return new NextResponse(null, { status: 204, headers: corsHeaders });
    }

    try {
        const proxyRequest = ProxyRequestSchema.parse(await req.json());
        const requestBody = await buildRequestBody(proxyRequest.body);
        const headers = new Headers(proxyRequest.headers);

        // omit content-type for multipart/form-data so that fetch can set it automatically with the boundary
        const contentType = headers.get("Content-Type");
        if (contentType != null && contentType.toLowerCase().includes("multipart/form-data")) {
            headers.delete("Content-Type");
        }

        const response = await fetch(proxyRequest.url, {
            method: proxyRequest.method,
            headers,
            body: requestBody,
        });

        const responseHeaders = new Headers(response.headers);
        Object.entries(corsHeaders).forEach(([key, value]) => {
            responseHeaders.set(key, value);
        });

        return new NextResponse(response.body, {
            headers: responseHeaders,
            status: response.status,
            statusText: response.statusText,
        });
    } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err);
        return new NextResponse(null, { status: 500, headers: corsHeaders });
    }
}
