import { ProxyRequestSchema } from "@fern-ui/docs-fe";
import { NextRequest, NextResponse } from "next/server";

/**
 * Note: edge functions must return a response within 25 seconds.
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
        const startTime = Date.now();
        const response = await fetch(proxyRequest.url, {
            method: proxyRequest.method,
            headers: proxyRequest.headers,
            body: proxyRequest.body != null ? JSON.stringify(proxyRequest.body.value) : undefined,
        });
        if (response.body != null) {
            const encoder = new TextEncoder();
            const decoder = new TextDecoder();
            const transformStream = new TransformStream<Uint8Array, Uint8Array>({
                transform(chunk, controller) {
                    const endTime = Date.now();
                    const text = decoder.decode(chunk);
                    controller.enqueue(
                        encoder.encode(JSON.stringify({ data: text, time: endTime - startTime }) + "\n"),
                    );
                },
            });

            const responseHeaders = new Headers({
                "Content-Type": "application/json",
                "Transfer-Encoding": "chunked",
            });
            Object.entries(corsHeaders).forEach(([key, value]) => {
                responseHeaders.set(key, value);
            });

            return new NextResponse(response.body.pipeThrough(transformStream), {
                headers: responseHeaders,
            });
        } else {
            return new NextResponse(null, {
                status: response.status,
                statusText: response.statusText,
                headers: corsHeaders,
            });
        }
    } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err);
        return new NextResponse(null, { status: 500, headers: corsHeaders });
    }
}
