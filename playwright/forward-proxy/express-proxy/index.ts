import express from "express";
import http from "http";
import { createProxyMiddleware } from "http-proxy-middleware";

export function startProxyServer(target: string, origin: string): http.Server {
    const app = express();

    const headers: Record<string, string> = {
        "x-fern-host": new URL(target).hostname,
    };

    if (process.env.APP_BUILDWITHFERN_COM_PROTECTION_BYPASS) {
        headers["x-vercel-protection-bypass"] = process.env.APP_BUILDWITHFERN_COM_PROTECTION_BYPASS;
    }

    const proxyMiddleware = createProxyMiddleware({
        target: origin,
        headers,
        changeOrigin: true,
        followRedirects: true,
        autoRewrite: true,
    });

    // redirect to /subpath/capture-the-flag
    app.use("/subpath/test-capture-the-flag", (_req, res) => {
        res.redirect(302, "/subpath/capture-the-flag");
    });

    app.use((req, res, next) => {
        if (req.url.startsWith("/subpath") || req.url.startsWith("/_next")) {
            return proxyMiddleware(req, res, next);
        } else {
            return next();
        }
    });

    app.use((_req, res) => {
        res.status(404).send("PROXY_NOT_FOUND_ERROR");
    });

    const server = app.listen(0, () => {
        // eslint-disable-next-line no-console
        console.log(`Proxy app listening on ${getProxyUrl(server)}`);
    });

    return server;
}

export function getProxyUrl(server: http.Server): string {
    const address = server.address();
    if (typeof address === "string") {
        return `http://${address}`;
    }
    return `http://localhost:${address?.port}`;
}
