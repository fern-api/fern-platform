import { buildFormData } from "@/server/buildFormData";
import { resolveSerializableFile } from "@/server/resolveSerializableFile";
import { FernProxyClient } from "@fern-fern/proxy-sdk";
import { assertNever } from "@fern-ui/core-utils";
import type { ProxyRequest } from "@fern-ui/ui";
import type { NextApiRequest, NextApiResponse } from "next/types";
import { Headers, type BodyInit } from "node-fetch";

/**
 * Note: this API route must be deployed as an node.js serverless function because
 * edge functions must return a response within 25 seconds.
 *
 * NodeJS serverless functions can have a maximum execution time of 5 minutes.
 *
 * TODO: this is kind of expensive to run as a serverless function in vercel. We should consider moving this to cloudflare workers.
 */

export const config = {
    maxDuration: 300, // 5 minutes
};

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
            const form = await buildFormData(body.value);
            return [undefined, form];
        }
        case "octet-stream": {
            if (body.value == null) {
                return [undefined, undefined];
            }
            return resolveSerializableFile(body.value);
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
        const headers = new Headers(req.body.headers);

        headers.set("Content-Type", "application/json");

        const startTime = Date.now();

        const grpcClient = new FernProxyClient({
            environment: "https://kmxxylsbwyu2f4x7rbhreris3i0zfbys.lambda-url.us-east-1.on.aws/",
        });

        const grpcResponse = await grpcClient.grpc({
            baseUrl: req.body.baseUrl,
            endpoint: req.body.endpointId,
            headers: req.body.headers,
            body: req.body.body,
            schema: undefined,
        });

        // commented out
        // let body = grpcResponse.body as string;

        const endTime = Date.now();

        // eslint-disable-next-line no-console
        console.log("Proxy request to", req.url, "received response body after", endTime - startTime, "milliseconds");

        // commented out
        // try {
        //     body = JSON.parse(body);
        // } catch (e) {
        //     // eslint-disable-next-line no-console
        //     console.log("Failed to parse response body as JSON, but will return it as text.");
        //     // eslint-disable-next-line no-console
        //     console.error(e);
        // }

        return res.status(200).json({
            response: {
                // body,
                grpcResponse,
            },
            time: endTime - startTime,
            size: new TextEncoder().encode(JSON.stringify(grpcResponse.body)).length,
            // size: new TextEncoder().encode(JSON.stringify(body)).length,
        });
    } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err);
        return res.status(500).send(null);
    }
}
