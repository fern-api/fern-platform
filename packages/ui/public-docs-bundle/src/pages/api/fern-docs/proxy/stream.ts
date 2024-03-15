import { ProxyRequest, Stream } from "@fern-ui/ui";
import { NextApiHandler, NextApiResponse } from "next";

const proxyApiHandler: NextApiHandler = async (req, res: NextApiResponse<void>) => {
    try {
        if (req.method !== "POST") {
            res.status(400).end();
            return;
        }

        const proxyRequest = (typeof req.body === "object" ? req.body : JSON.parse(req.body)) as ProxyRequest;
        const startTime = Date.now();
        const response = await fetch(proxyRequest.url, {
            method: proxyRequest.method,
            headers: proxyRequest.headers,
            body: proxyRequest.body != null ? JSON.stringify(proxyRequest.body.value) : undefined,
        });
        if (response.body != null) {
            const stream = new Stream({
                stream: response.body,
                terminator: "\n", // TODO: This should be passed in via API Reference
            });
            res.writeHead(response.status, undefined, {
                "Content-Type": response.headers.get("Content-Type") ?? "application/json",
                "Transfer-Encoding": "chunked",
            });
            res.flushHeaders();
            for await (const chunk of stream) {
                const endTime = Date.now();
                res.write(JSON.stringify({ data: chunk, time: endTime - startTime }) + "\n");
            }
            res.end();
        } else {
            res.status(response.status).end();
        }
    } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err);
        res.status(500).end();
    }
};

export default proxyApiHandler;
