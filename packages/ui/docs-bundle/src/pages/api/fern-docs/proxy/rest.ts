import { assertNever } from "@fern-ui/core-utils";
import type { ProxyRequest } from "@fern-ui/ui";
import { ProxyRequestSchema, unknownToString } from "@fern-ui/ui";
import FormData from "form-data";
import type { NextApiRequest, NextApiResponse } from "next/types";
import fetch, { Headers, type BodyInit } from "node-fetch";

/**
 * Note: this API route must be deployed as an node.js serverless function because
 * edge functions must return a response within 25 seconds.
 *
 * NodeJS serverless functions can have a maximum execution time of 5 minutes.
 *
 * TODO: this is kind of expensive to run as a serverless function in vercel. We should consider moving this to cloudflare workers.
 */

export const config = {
    maxDuration: 60 * 5, // 5 minutes
};

async function parseDataUrl(dataUrl: string): Promise<[mime: string | undefined, ArrayBuffer]> {
    if (dataUrl.startsWith("http:") || dataUrl.startsWith("https:")) {
        const response = await fetch(dataUrl);
        const blob = await response.arrayBuffer();
        return [response.headers.get("Content-Type") ?? undefined, blob];
    }

    const [header, base64String] = dataUrl.split(",");
    if (header == null || base64String == null) {
        throw new Error("Invalid data URL");
    }

    const mime = header.match(/:(.*?);/)?.[1];
    const bstr = Buffer.from(base64String, "base64");
    return [mime, bstr];
}

export async function buildRequestBody(
    body: ProxyRequest.SerializableBody | undefined,
): Promise<[mime: string | undefined, BodyInit | undefined]> {
    if (body == null) {
        return [undefined, undefined];
    }

    switch (body.type) {
        case "json":
            return ["application/json", JSON.stringify(body.value)];
        case "form-data": {
            const form = new FormData();
            for (const [key, value] of Object.entries(body.value)) {
                switch (value.type) {
                    case "file":
                        if (value.value != null) {
                            const base64 = value.value.dataUrl;
                            const [contentType, buffer] = await parseDataUrl(base64);
                            form.append(key, buffer, {
                                filename: value.value.name,
                                contentType,
                            });
                        }
                        break;
                    case "fileArray": {
                        for (const serializedFile of value.value) {
                            const base64 = serializedFile.dataUrl;
                            const [contentType, buffer] = await parseDataUrl(base64);
                            form.append(key, buffer, {
                                filename: serializedFile.name,
                                contentType,
                            });
                        }
                        break;
                    }
                    case "json": {
                        const content = value.contentType?.includes("application/json")
                            ? JSON.stringify(value.value)
                            : unknownToString(value.value);
                        form.append(key, content, { contentType: value.contentType });
                        break;
                    }
                    default:
                        assertNever(value);
                }
            }
            return [undefined, form];
        }
        case "octet-stream": {
            if (body.value == null) {
                return [undefined, undefined];
            }
            const base64 = body.value.dataUrl;
            return parseDataUrl(base64);
        }
        default:
            assertNever(body);
    }
}

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

        const startTime = Date.now();

        const response = await fetch(proxyRequest.url, {
            method: proxyRequest.method,
            headers,
            body: requestBody,
        });

        // eslint-disable-next-line no-console
        console.log("Proxy request to", req.url, "completed with status", response.status);

        let body = await response.text();
        const endTime = Date.now();

        // eslint-disable-next-line no-console
        console.log("Proxy request to", req.url, "received response body after", endTime - startTime, "milliseconds");

        try {
            body = JSON.parse(body);
        } catch (e) {
            // eslint-disable-next-line no-console
            console.log("Failed to parse response body as JSON, but will return it as text.");
            // eslint-disable-next-line no-console
            console.error(e);
        }
        const responseHeaders = response.headers;

        return res.status(200).json({
            response: {
                headers: Object.fromEntries(responseHeaders.entries()),
                ok: response.ok,
                redirected: response.redirected,
                status: response.status,
                statusText: response.statusText,
                type: response.type,
                url: response.url,
                body,
            },
            time: endTime - startTime,
            size: responseHeaders.get("Content-Length"),
        });
    } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err);
        return res.status(500).send(null);
    }
}
