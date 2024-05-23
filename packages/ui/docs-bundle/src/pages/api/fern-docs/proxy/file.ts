import { ProxyRequest } from "@fern-ui/ui";
import { NextRequest, NextResponse } from "next/server";
import { buildRequestBody } from "./rest";

export const runtime = "edge";
export const dynamic = "force-dynamic";
export const maxDuration = 60 * 5; // 5 minutes

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
        const proxyRequest = (await req.json()) as ProxyRequest;
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
