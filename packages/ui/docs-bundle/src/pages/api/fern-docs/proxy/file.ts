import { ProxyRequestSchema } from "@fern-ui/ui";
import type { NextApiRequest, NextApiResponse } from "next/types";
import fetch, { Headers } from "node-fetch";
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
        // For audio streaming, we need to ensure we get the raw stream
        if (!response.body) {
            return res.status(response.status).send(undefined);
        }

        // Set response headers before starting stream
        res.writeHead(response.status, Object.fromEntries(response.headers.entries()));

        // Create a new stream from the response body
        const stream = response.body as unknown as ReadableStream<Uint8Array>;
        const reader = stream.getReader();
        const read = async () => {
            try {
                let isDone = false;
                while (!isDone) {
                    const { done, value } = await reader.read();
                    isDone = done;
                    if (done) {
                        break;
                    }
                    res.write(value);
                }
            } finally {
                res.end();
            }
        };

        await read();
    } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err);
        return res.status(500).send(null);
    }
}
