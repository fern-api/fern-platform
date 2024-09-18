import { ExecSyncOptions, execFileSync } from "child_process";
import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import { chromium } from "playwright";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";

const origin = "http://localhost:3000";
const target = "https://test-nginx-proxy.docs.dev.buildwithfern.com/subpath";
const proxy = "http://localhost:5050/subpath";

describe("nginx-proxy", () => {
    const server = express();
    let browser: Awaited<ReturnType<typeof chromium.launch>>;

    beforeAll(async () => {
        // requires FERN_TOKEN
        const result = exec("fern-dev generate --docs", { cwd: __dirname });
        expect(result).toContain(`Published docs to ${target}`);

        const proxyMiddleware = createProxyMiddleware({
            target: origin,
            headers: { "x-fern-host": new URL(target).hostname },
            changeOrigin: true,
            followRedirects: true,
        });

        server.use(["/subpath", "/subpath/*"], proxyMiddleware);

        server.use((_req, res) => {
            res.status(404).send("PROXY_NOT_FOUND_ERROR");
        });

        server.listen(5050, () => {
            // eslint-disable-next-line no-console
            console.log(`Proxy server listening on ${proxy}`);
        });

        browser = await chromium.launch();
    });

    afterAll(async () => {
        await browser.close();
    });

    let page: Awaited<ReturnType<typeof browser.newPage>>;
    beforeEach(async () => {
        page = await browser.newPage();
    });

    afterEach(async () => {
        await page.close();
    });

    it("home page 404", async () => {
        const response = await page.goto("http://localhost:5050");
        expect(response).toBeDefined();
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const definedResponse = response!;
        expect(definedResponse.status()).toBe(404);
        expect(await definedResponse.text()).toBe("PROXY_NOT_FOUND_ERROR");
    });

    it("subpath should 200", async () => {
        const response = await page.goto("http://localhost:5050/subpath");
        expect(response).toBeDefined();
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const definedResponse = response!;
        expect(definedResponse.status()).toBe(200);
        expect(await definedResponse.text()).toContain("Hello world!");
    });

    it("sitemap.xml should match snapshot", async () => {
        const response = await page.goto("http://localhost:5050/subpath/sitemap.xml");
        expect(response).toBeDefined();
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const definedResponse = response!;
        expect(definedResponse.status()).toBe(200);
        expect(await definedResponse.text()).toMatchSnapshot();
    });

    it("revalidate-all/v3 all should work", async () => {
        const response = await page.goto("http://localhost:5050/subpath/api/fern-docs/revalidate-all/v3");
        expect(response).toBeDefined();
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const definedResponse = response!;
        expect(definedResponse.status()).toBe(200);

        const results = await definedResponse.json();

        expect(results.successfulRevalidations).toHaveLength(1);
        expect(results.failedRevalidations).toHaveLength(0);
    });

    it("revalidate-all/v3 should work with trailing slash", async () => {
        const response = await page.goto("http://localhost:5050/subpath/api/fern-docs/revalidate-all/v3/");
        expect(response).toBeDefined();
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const definedResponse = response!;
        expect(definedResponse.status()).toBe(200);

        const results = await definedResponse.json();

        expect(results.successfulRevalidations).toHaveLength(1);
        expect(results.failedRevalidations).toHaveLength(0);
    });

    it("revalidate-all/v4 should work", async () => {
        const response = await page.goto("http://localhost:5050/subpath/api/fern-docs/revalidate-all/v4");
        expect(response).toBeDefined();
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const definedResponse = response!;
        expect(definedResponse.status()).toBe(200);

        const results = await definedResponse.json();

        expect(results.total).toBe(1);
        expect(results.results).toHaveLength(1);
        expect(results.results[0].success).toBeTruthy();
    });

    it("revalidate-all/v4 should work with trailing slash", async () => {
        const response = await page.goto("http://localhost:5050/subpath/api/fern-docs/revalidate-all/v4/");
        expect(response).toBeDefined();
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const definedResponse = response!;
        expect(definedResponse.status()).toBe(200);

        const results = await definedResponse.json();

        expect(results.total).toBe(1);
        expect(results.results).toHaveLength(1);
        expect(results.results[0].success).toBeTruthy();
    });
});

function exec(command: string | string[], opts?: ExecSyncOptions): string {
    const cmd = (Array.isArray(command) ? command : command.split(" ")).filter((c) => c.trim().length > 0);

    if (!cmd[0]) {
        throw new Error("Empty command");
    }

    try {
        return String(
            execFileSync(cmd[0], cmd.slice(1), {
                stdio: ["inherit", "pipe", "pipe"],
                ...opts,
                env: { ...process.env, ...opts?.env },
            }),
        );
    } catch (e) {
        throw String(e);
    }
}
