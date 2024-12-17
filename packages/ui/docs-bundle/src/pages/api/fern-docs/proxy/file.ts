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

        // Set headers first for all response types
        res.writeHead(response.status, Object.fromEntries(response.headers.entries()));

        // Handle JSON responses
        const responseContentType = response.headers.get("content-type");
        if (responseContentType?.includes("application/json")) {
            try {
                const json = await response.json();
                return res.json(json);
            } catch (err) {
                return res.status(500).json({ error: "Invalid JSON response" });
            }
        }

        // Handle empty responses
        if (!response.body) {
            res.end();
            return;
        }

        // Stream handling
        if (response.body instanceof ReadableStream) {
            const reader = response.body.getReader();
            try {
                // eslint-disable-next-line no-constant-condition
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) {
                        break;
                    }
                    res.write(value);
                }
            } catch (err) {
                throw new Error(`Stream reading failed: ${err.message}`);
            } finally {
                res.end();
            }
        } else if (response.body && typeof response.body.pipe === "function") {
            await new Promise((resolve, reject) => {
                response.body.pipe(res);
                response.body.on("end", resolve);
                response.body.on("error", (err) => {
                    (response.body as any).destroy();
                    reject(new Error(`Pipe streaming failed: ${err.message}`));
                });
            });
        } else {
            throw new Error("Unsupported response body type");
        }
    } catch (err) {
        // If headers haven't been sent, send error response
        if (!res.headersSent) {
            res.status(500).json({ error: err.message });
        } else {
            // If headers were sent, just end the response
            res.end();
        }
        throw err; // Re-throw for upstream error handling
    }
}
