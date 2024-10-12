import { ExecSyncOptions, execFileSync } from "child_process";
import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import { chromium } from "playwright";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { getDeploymentOrigin } from "../../utils/deployment-url";

const origin = getDeploymentOrigin();

const target = "https://test-nginx-proxy.docs.buildwithfern.com/subpath";
const proxy = "http://localhost:5050/subpath";

describe("nginx-proxy", () => {
    const server = express();
    let browser: Awaited<ReturnType<typeof chromium.launch>>;

    beforeAll(async () => {
        const result = exec("fern generate --docs", { cwd: __dirname });
        expect(result).toContain(`Published docs to ${target}`);

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
        server.use("/subpath/test-capture-the-flag", (_req, res) => {
            res.redirect(302, "/subpath/capture-the-flag");
        });

        server.use((req, res, next) => {
            if (req.url.startsWith("/subpath")) {
                return proxyMiddleware(req, res, next);
            } else {
                return next();
            }
        });

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
        await browser?.close();
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

    it("subpath should 200 and capture the flag", async () => {
        const response = await page.goto("http://localhost:5050/subpath");
        expect(response).toBeDefined();
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const definedResponse = response!;
        expect(definedResponse.status()).toBe(200);
        expect(await definedResponse.text()).toContain("Hello world!");

        // capture the flag
        const text = page.getByText("capture-the-flag");
        expect(await text.count()).toBe(1);
        await text.click({ force: true });
        await page.waitForURL(/(capture-the-flag)/);
        expect(await page.content()).not.includes("Application error");
        expect(page.url()).equals(`${proxy}/capture-the-flag`);
        expect(await page.content()).toContain("capture_the_flag");
    }, 20_000);

    it("subpath/test-capture-the-flag should redirect to subpath/capture-the-flag", async () => {
        const response = await page.goto("http://localhost:5050/subpath/test-capture-the-flag");
        expect(response).toBeDefined();
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const definedResponse = response!;
        expect(definedResponse.status()).toBe(200);
        expect(definedResponse.url()).toContain("/subpath/capture-the-flag");
    });

    it("subpath/test-3 should be 404", async () => {
        const response = await page.goto("http://localhost:5050/subpath/test-3");
        expect(response).toBeDefined();
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const definedResponse = response!;
        expect(definedResponse.status()).toBe(404);
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
        const response = await page.goto("http://localhost:5050/subpath/api/fern-docs/revalidate-all/v3", {
            timeout: 10_000,
        });
        expect(response).toBeDefined();
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const definedResponse = response!;
        expect(definedResponse.status()).toBe(200);

        const results = await definedResponse.json();

        expect(results.successfulRevalidations).toHaveLength(2);
        expect(results.failedRevalidations).toHaveLength(0);
    }, 10_000);

    it("revalidate-all/v3 should work with trailing slash", async () => {
        const response = await page.goto("http://localhost:5050/subpath/api/fern-docs/revalidate-all/v3/", {
            timeout: 10_000,
        });
        expect(response).toBeDefined();
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const definedResponse = response!;
        expect(definedResponse.status()).toBe(200);

        const results = await definedResponse.json();

        expect(results.successfulRevalidations).toHaveLength(2);
        expect(results.failedRevalidations).toHaveLength(0);
    }, 10_000);

    it("revalidate-all/v4 should work", async () => {
        const response = await page.goto("http://localhost:5050/subpath/api/fern-docs/revalidate-all/v4", {
            timeout: 10_000,
        });
        expect(response).toBeDefined();
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const definedResponse = response!;
        expect(definedResponse.status()).toBe(200);

        const results = await definedResponse.json();

        expect(results.total).toBe(2);
        expect(results.results).toHaveLength(2);
        expect((results.results as object[]).map((r) => "success" in r && r.success)).toEqual([true, true]);
    }, 10_000);

    it("revalidate-all/v4 should work with trailing slash", async () => {
        const response = await page.goto("http://localhost:5050/subpath/api/fern-docs/revalidate-all/v4/", {
            timeout: 10_000,
        });
        expect(response).toBeDefined();
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const definedResponse = response!;
        expect(definedResponse.status()).toBe(200);

        const results = await definedResponse.json();

        expect(results.total).toBe(2);
        expect(results.results).toHaveLength(2);
        expect((results.results as object[]).map((r) => "success" in r && r.success)).toEqual([true, true]);
    });
}, 10_000);

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
