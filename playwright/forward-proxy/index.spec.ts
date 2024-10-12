import test, { expect } from "@playwright/test";
import execa from "execa";
import express from "express";
import http from "http";
import { createProxyMiddleware } from "http-proxy-middleware";
import { getPreviewDeploymentUrl } from "../utils";
const origin = getPreviewDeploymentUrl();

const target = "https://test-nginx-proxy.docs.buildwithfern.com/subpath";

const app = express();
let server: http.Server;

function getProxyUrl() {
    const address = server.address();
    if (typeof address === "string") {
        return `http://${address}`;
    }
    return `http://localhost:${address?.port}`;
}

test.setTimeout(120_000);

test.beforeAll(async () => {
    const result = await execa("fern", ["generate", "--docs"], { cwd: __dirname });
    expect(result.stdout).toContain(`Published docs to ${target}`);

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

    server = app.listen(0, () => {
        // eslint-disable-next-line no-console
        console.log(`Proxy app listening on ${getProxyUrl()}`);
    });
});

test.afterAll(async () => {
    server?.close();
});

test("home page 404", async ({ page }) => {
    const response = await page.goto(new URL("/", getProxyUrl()).toString());
    expect(response).toBeDefined();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const definedResponse = response!;
    expect(definedResponse.status()).toBe(404);
    expect(await definedResponse.text()).toBe("PROXY_NOT_FOUND_ERROR");
});

test("subpath should 200 and capture the flag", async ({ page }) => {
    const response = await page.goto(new URL("/subpath", getProxyUrl()).toString());
    expect(response).toBeDefined();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const definedResponse = response!;
    expect(definedResponse.status()).toBe(200);
    expect(await definedResponse.text()).toContain("Hello world!");

    // capture the flag
    const text = page.getByText("capture-the-flag");
    expect(await text.count()).toBe(1);
    await text.click();

    await page.waitForURL(/(capture-the-flag)/);
    expect(await page.content()).not.toContain("Application error");
    expect(page.url()).toEqual(`${getProxyUrl()}/subpath/capture-the-flag`);
    expect(await page.content()).toContain("capture_the_flag");
});

test("subpath/test-capture-the-flag should redirect to subpath/capture-the-flag", async ({ page }) => {
    const response = await page.goto(new URL("/subpath/test-capture-the-flag", getProxyUrl()).toString());
    expect(response).toBeDefined();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const definedResponse = response!;
    expect(definedResponse.status()).toBe(200);
    expect(definedResponse.url()).toContain("/subpath/capture-the-flag");
});

test("subpath/test-3 should be 404", async ({ page }) => {
    const response = await page.goto(new URL("/subpath/test-3", getProxyUrl()).toString());
    expect(response).toBeDefined();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const definedResponse = response!;
    expect(definedResponse.status()).toBe(404);
});

test("sitemap.xml should match snapshot", async ({ page }) => {
    const response = await page.goto(new URL("/subpath/sitemap.xml", getProxyUrl()).toString());
    expect(response).toBeDefined();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const definedResponse = response!;
    expect(definedResponse.status()).toBe(200);
    expect(await definedResponse.text()).toMatchSnapshot();
});

test("revalidate-all/v3 all should work", async ({ page }) => {
    test.setTimeout(10_000);
    const response = await page.goto(new URL("/subpath/api/fern-docs/revalidate-all/v3", getProxyUrl()).toString(), {
        timeout: 10_000,
    });
    expect(response).toBeDefined();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const definedResponse = response!;
    expect(definedResponse.status()).toBe(200);

    const results = await definedResponse.json();

    expect(results.successfulRevalidations).toHaveLength(2);
    expect(results.failedRevalidations).toHaveLength(0);
});

test("revalidate-all/v3 should work with trailing slash", async ({ page }) => {
    test.setTimeout(10_000);
    const response = await page.goto(new URL("/subpath/api/fern-docs/revalidate-all/v3/", getProxyUrl()).toString(), {
        timeout: 10_000,
    });
    expect(response).toBeDefined();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const definedResponse = response!;
    expect(definedResponse.status()).toBe(200);

    const results = await definedResponse.json();

    expect(results.successfulRevalidations).toHaveLength(2);
    expect(results.failedRevalidations).toHaveLength(0);
});

test("revalidate-all/v4 should work", async ({ page }) => {
    test.setTimeout(10_000);
    const response = await page.goto(new URL("/subpath/api/fern-docs/revalidate-all/v4", getProxyUrl()).toString(), {
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

test("revalidate-all/v4 should work with trailing slash", async ({ page }) => {
    test.setTimeout(10_000);
    const response = await page.goto(new URL("/subpath/api/fern-docs/revalidate-all/v4/", getProxyUrl()).toString(), {
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
