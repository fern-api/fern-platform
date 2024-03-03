import { NextRequest, NextResponse } from "next/server";
import { jsonResponse } from "../../utils/serverResponse";

interface ProxyRequest {
    url: string;
    method: string;
    headers: Record<string, string>;
    body: unknown | undefined;
}

interface ProxyResponseError {
    type: "error";
    body: unknown;
    status: number;
    time: number;
    size: string | null;
}

interface ProxyResponseSuccess {
    type: "success";
    body: unknown;
    status: number;
    time: number;
    size: string | null;
    headers: Record<string, string>;
}

type ProxyResponse = ProxyResponseError | ProxyResponseSuccess;

export const runtime = "edge";

export default async function POST(req: NextRequest): Promise<NextResponse> {
    if (req.method !== "POST") {
        return new NextResponse(null, { status: 405 });
    }
    const startTime = performance.now();
    try {
        const proxyRequest = (typeof req.body === "object" ? req.body : JSON.parse(req.body)) as ProxyRequest;
        const response = await fetch(proxyRequest.url, {
            method: proxyRequest.method,
            headers: proxyRequest.headers,
            body: proxyRequest.body != null ? JSON.stringify(proxyRequest.body) : undefined,
        });
        let body = await response.text();
        try {
            body = JSON.parse(body);
        } catch (_e) {
            // Ignore
        }
        const endTime = performance.now();
        const headers = response.headers;

        return jsonResponse<ProxyResponse>(200, {
            type: "success",
            body,
            status: response.status,
            time: endTime - startTime,
            size: headers.get("Content-Length"),
            headers: Object.fromEntries(headers.entries()),
        });
    } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err);
        const endTime = performance.now();

        return jsonResponse<ProxyResponse>(500, {
            type: "error",
            body: "An unknown server error occured.",
            status: 500,
            time: endTime - startTime,
            size: null,
        });
    }
}
