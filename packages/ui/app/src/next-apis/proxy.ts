import { NextApiHandler, NextApiResponse } from "next";
import { Stream } from "../api-playground/Stream";

interface ProxyRequest {
    url: string;
    method: string;
    headers: Record<string, string>;
    body: unknown | undefined;
    stream?: boolean;
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

export const proxyApiHandler: NextApiHandler = async (req, res: NextApiResponse<ProxyResponse>) => {
    const startTime = performance.now();
    try {
        if (req.method !== "POST") {
            res.status(400).json({
                type: "error",
                body: "Only POST requests are supported",
                status: 400,
                time: 0,
                size: null,
            });
            return;
        }

        const proxyRequest = (typeof req.body === "object" ? req.body : JSON.parse(req.body)) as ProxyRequest;
        const response = await fetch(proxyRequest.url, {
            method: proxyRequest.method,
            headers: proxyRequest.headers,
            body: proxyRequest.body != null ? JSON.stringify(proxyRequest.body) : undefined,
        });
        if (!proxyRequest.stream) {
            const body = await response.json();
            const endTime = performance.now();
            const headers = response.headers;

            res.status(200).json({
                type: "success",
                body,
                status: response.status,
                time: endTime - startTime,
                size: headers.get("Content-Length"),
                headers: Object.fromEntries(headers.entries()),
            });
        } else if (response.body != null) {
            const stream = new Stream({
                stream: response.body,
                parse: async (i) => JSON.stringify(i) + "\n",
                terminator: "\n",
            });
            res.writeHead(response.status, undefined, {
                "Content-Type": "application/json",
                "Transfer-Encoding": "chunked",
            });
            res.flushHeaders();
            for await (const chunk of stream) {
                res.write(chunk);
            }
            res.end();
        }
    } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err);
        const endTime = performance.now();
        res.status(500).json({
            type: "error",
            body: "An unknown server error occured.",
            status: 500,
            time: endTime - startTime,
            size: null,
        });
    }
};
