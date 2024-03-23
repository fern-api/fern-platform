import { ProxyRequest } from "@fern-ui/ui";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";
export const dynamic = "force-dynamic";
export const maxDuration = 60 * 5; // 5 minutes

export default async function POST(req: NextRequest): Promise<NextResponse> {
    try {
        if (req.method !== "POST") {
            return new NextResponse(null, { status: 405 });
        }

        const proxyRequest = (await req.json()) as ProxyRequest;
        const startTime = Date.now();
        const response = await fetch(proxyRequest.url, {
            method: proxyRequest.method,
            headers: proxyRequest.headers,
            body: proxyRequest.body != null ? JSON.stringify(proxyRequest.body.value) : undefined,
        });
        if (response.body != null) {
            const encoder = new TextEncoder();
            const decoder = new TextDecoder();
            const transformStream = new TransformStream({
                transform(chunk, controller) {
                    const endTime = Date.now();
                    const text = decoder.decode(chunk);
                    controller.enqueue(
                        encoder.encode(JSON.stringify({ data: text, time: endTime - startTime }) + "\n"),
                    );
                },
            });

            return new NextResponse(response.body.pipeThrough(transformStream), {
                headers: {
                    "Content-Type": "application/json",
                    "Transfer-Encoding": "chunked",
                },
            });
        } else {
            return new NextResponse(null, { status: response.status, statusText: response.statusText });
        }
    } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err);
        return new NextResponse(null, { status: 500 });
    }
}
