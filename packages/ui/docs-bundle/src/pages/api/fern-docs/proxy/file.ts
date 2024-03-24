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
        const response = await fetch(proxyRequest.url, {
            method: proxyRequest.method,
            headers: proxyRequest.headers,
            body: proxyRequest.body != null ? JSON.stringify(proxyRequest.body.value) : undefined,
        });
        return new NextResponse(response.body, {
            headers: response.headers,
            status: response.status,
            statusText: response.statusText,
        });
    } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err);
        return new NextResponse(null, { status: 500 });
    }
}
