import { NextApiHandler, NextApiResponse } from "next";

interface ProxyRequest {
    url: string;
    method: string;
    headers: Record<string, string>;
    body: unknown;
}

interface ProxyResponseError {
    type: "error";
}

interface ProxyResponseSuccess {
    type: "success";
    body: unknown;
    status: number;
    time: number;
    size: string | null;
}

type ProxyResponse = ProxyResponseError | ProxyResponseSuccess;

const handler: NextApiHandler = async (req, res: NextApiResponse<ProxyResponse>) => {
    try {
        if (req.method !== "POST") {
            res.status(400).json({ type: "error" });
            return;
        }

        const proxyRequest = req.body as ProxyRequest;

        const startTime = performance.now();
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
        });
    } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err);
        res.status(500).json({ type: "error" });
    }
};

export default handler;
