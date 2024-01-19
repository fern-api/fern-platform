import { NextApiHandler, NextApiResponse } from "next";

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

const handler: NextApiHandler = async (req, res: NextApiResponse<ProxyResponse>) => {
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

export default handler;
