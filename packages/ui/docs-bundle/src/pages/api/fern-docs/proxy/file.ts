import { ProxyRequestSchema } from "@fern-ui/ui";
import type { NextApiRequest, NextApiResponse } from "next/types";
import fetch, { Headers } from "node-fetch";
import { ServerResponse } from "node:http";
import { buildRequestBody } from "./rest";

/**
 * Note: this API route must be deployed as an node.js serverless function because
 * edge functions must return a response within 25 seconds.
 *
 * This function is used to return the response directly from the proxied request, and is useful for file downloads.
 *
 * TODO: this is kind of expensive to run as a serverless function in vercel. We should consider moving this to cloudflare workers.
 */

export const config = {
    maxDuration: 300, // 5 minutes
};

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    if (req.method !== "POST" && req.method !== "OPTIONS") {
        return res.status(405).send(null);
    }

    const origin = req.headers.origin;
    if (origin == null) {
        return res.status(400).send(null);
    }

    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Methods", "POST");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
        return res.status(204).send(null);
    }

    // eslint-disable-next-line no-console
    console.log("Starting proxy request to", req.url);

    try {
        const proxyRequest = ProxyRequestSchema.parse(req.body);
        const [mime, requestBody] = await buildRequestBody(proxyRequest.body);
        const headers = new Headers(proxyRequest.headers);

        // omit content-type for multipart/form-data so that fetch can set it automatically with the boundary
        const contentType = headers.get("Content-Type");
        if (contentType != null && contentType.toLowerCase().includes("multipart/form-data")) {
            headers.delete("Content-Type");
        } else if (mime != null) {
            headers.set("Content-Type", mime);
        }

        const response = await fetch(proxyRequest.url, {
            method: proxyRequest.method,
            headers,
            body: requestBody,
        });

        response.headers.forEach((value, name) => {
            res.setHeader(name, value);
        });

        // Handle JSON responses more efficiently
        const responseContentType = response.headers.get("content-type");
        if (responseContentType?.includes("application/json")) {
            const json = await response.json();
            return res.status(response.status).json(json);
        }

        // Stream other response types
        writeToServerResponse({
            response: res,
            status: response.status,
            headers: Object.fromEntries(response.headers.entries()),
            stream: response.body,
        });
    } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err);
        return res.status(500).send(null);
    }
}

/**
 * Writes the content of a stream to a server response.
 */
export function writeToServerResponse({
    response,
    status,
    statusText,
    headers,
    stream,
}: {
    response: ServerResponse;
    status?: number;
    statusText?: string;
    headers?: Record<string, string | number | string[]>;
    stream: ReadableStream<Uint8Array>;
}): void {
    response.writeHead(status ?? 200, statusText, headers);

    const reader = stream.getReader();
    const read = async () => {
        try {
            // eslint-disable-next-line no-constant-condition
            while (true) {
                const { done, value } = await reader.read();
                if (done) {
                    break;
                }
                response.write(value);
            }
        } finally {
            response.end();
        }
    };

    void read();
}
