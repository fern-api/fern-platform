import { assertNever } from "@fern-ui/core-utils";
import type { ProxyRequest } from "@fern-ui/ui";
import { ProxyRequestSchema, unknownToString } from "@fern-ui/ui";
import type { NextApiRequest, NextApiResponse } from "next/types";

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

async function dataURLtoBlob(dataUrl: string): Promise<Blob> {
    if (dataUrl.startsWith("http:") || dataUrl.startsWith("https:")) {
        const response = await fetch(dataUrl);
        return await response.blob();
    }

    const [header, base64String] = dataUrl.split(",");
    if (header == null || base64String == null) {
        throw new Error("Invalid data URL");
    }

    const mime = header.match(/:(.*?);/)?.[1];
    const bstr = atob(base64String);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);

    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }

    return new Blob([u8arr], { type: mime });
}

export async function buildRequestBody(body: ProxyRequest.SerializableBody | undefined): Promise<BodyInit | undefined> {
    if (body == null) {
        return undefined;
    }

    switch (body.type) {
        case "json":
            return JSON.stringify(body.value);
        case "form-data": {
            const formEntries = await Promise.all(
                Object.entries(body.value).map(async ([key, value]) => {
                    switch (value.type) {
                        case "file":
                            if (value.value != null) {
                                const base64 = value.value.dataUrl;
                                const blob = await dataURLtoBlob(base64);
                                const file = new File([blob], value.value.name, { type: value.value.type });
                                return [key, file] as const;
                            }
                            return [key, null] as const;
                        case "fileArray": {
                            const files = await Promise.all(
                                value.value.map(async (serializedFile) => {
                                    const base64 = serializedFile.dataUrl;
                                    const blob = await dataURLtoBlob(base64);
                                    return new File([blob], serializedFile.name, { type: serializedFile.type });
                                }),
                            );
                            return [key, files] as const;
                        }
                        case "json": {
                            if (value.contentType != null) {
                                return [
                                    key,
                                    new Blob(
                                        [
                                            value.contentType.includes("application/json")
                                                ? JSON.stringify(value.value)
                                                : unknownToString(value.value),
                                        ],
                                        { type: value.contentType },
                                    ),
                                ] as const;
                            }
                            return [key, JSON.stringify(value.value)] as const;
                        }
                        default:
                            assertNever(value);
                    }
                }),
            );

            const formData = new FormData();
            formEntries.forEach(([key, value]) => {
                if (value == null) {
                    return;
                }
                if (Array.isArray(value)) {
                    value.forEach((file) => formData.append(key, file, file.name));
                } else {
                    formData.append(key, value);
                }
            });
            return formData;
        }
        case "octet-stream": {
            if (body.value == null) {
                return undefined;
            }
            const base64 = body.value.dataUrl;
            const blob = await dataURLtoBlob(base64);
            return new File([blob], body.value.name, { type: body.value.type });
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
        const requestBody = await buildRequestBody(proxyRequest.body);
        const headers = new Headers(proxyRequest.headers);

        // omit content-type for multipart/form-data so that fetch can set it automatically with the boundary
        const contentType = headers.get("Content-Type");
        if (contentType != null && contentType.toLowerCase().includes("multipart/form-data")) {
            headers.delete("Content-Type");
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
        console.log("Proxy request to", req.url, "recieved response body after", endTime - startTime, "milliseconds");

        try {
            body = JSON.parse(body);
        } catch (e) {
            // eslint-disable-next-line no-console
            console.log("Failed to parse response body as JSON, but will return it as text.");
            // eslint-disable-next-line no-console
            console.error(e);
        }
        const responseHeaders = response.headers;

        res.status(200).json({
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
