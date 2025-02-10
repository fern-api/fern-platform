import test, { expect } from "@playwright/test";
import execa from "execa";
import http from "http";

import { getPreviewDeploymentUrl } from "../utils/utils";
import { getProxyUrl, startProxyServer } from "./express-proxy";

const origin = getPreviewDeploymentUrl();

const target = "https://test-nginx-proxy.docs.buildwithfern.com/subpath";

// Force the tests to run on a single worker
test.describe.configure({ mode: "serial" });

test.setTimeout(120_000);

let server: http.Server;

test.beforeAll(async () => {
  const result = await execa("fern", ["generate", "--docs"], {
    cwd: __dirname,
  });
  expect(result.stdout).toContain(`Published docs to ${target}`);

  server = startProxyServer(target, origin);
});

test.afterAll(async () => {
  server.close();
});

test("home page 404", async ({ page }) => {
  const response = await page.goto(
    new URL("/", getProxyUrl(server)).toString()
  );
  expect(response).toBeDefined();
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const definedResponse = response!;
  expect(definedResponse.status()).toBe(404);
  expect(await definedResponse.text()).toBe("PROXY_NOT_FOUND_ERROR");
});

// pnpm exec playwright test forward-proxy -g "capture the flag" --headed
test("capture the flag", async ({ page }) => {
  const response = await page.goto(
    new URL("/subpath", getProxyUrl(server)).toString()
  );
  expect(response).toBeDefined();
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const definedResponse = response!;
  expect(definedResponse.status()).toBe(200);
  expect(await definedResponse.text()).toContain("Hello world!");

  // capture the flag
  const text = page.getByText("capture-the-flag");
  await page.pause();
  expect(await text.count()).toBe(1);
  await text.click();

  await page.waitForURL(/(capture-the-flag)/);
  expect(await page.content()).not.toContain("Application error");
  expect(page.url()).toEqual(`${getProxyUrl(server)}/subpath/capture-the-flag`);
  expect(await page.content()).toContain("capture_the_flag");
});

test("redirect", async ({ page }) => {
  const response = await page.goto(
    new URL("/subpath/test-capture-the-flag", getProxyUrl(server)).toString()
  );
  expect(response).toBeDefined();
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const definedResponse = response!;
  expect(definedResponse.status()).toBe(200);
  expect(definedResponse.url()).toContain("/subpath/capture-the-flag");
});

test("404", async ({ page }) => {
  const response = await page.goto(
    new URL("/subpath/test-3", getProxyUrl(server)).toString()
  );
  expect(response).toBeDefined();
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const definedResponse = response!;
  expect(definedResponse.status()).toBe(404);
});

test("sitemap.xml", async ({ page }) => {
  const response = await page.goto(
    new URL("/subpath/sitemap.xml", getProxyUrl(server)).toString()
  );
  expect(response).toBeDefined();
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const definedResponse = response!;
  expect(definedResponse.status()).toBe(200);

  const text = await definedResponse.text();
  expect(text).toContain(
    "https://test-nginx-proxy.docs.buildwithfern.com/subpath/test-1"
  );
  expect(text).toContain(
    "https://test-nginx-proxy.docs.buildwithfern.com/subpath/capture-the-flag"
  );
  expect(text).not.toContain(
    "https://test-nginx-proxy.docs.buildwithfern.com/subpath/test-capture-the-flag"
  );
});

test("revalidate-all/v3 all should work", async ({ page }) => {
  test.setTimeout(10_000);
  const response = await page.goto(
    new URL(
      "/subpath/api/fern-docs/revalidate-all/v3",
      getProxyUrl(server)
    ).toString(),
    {
      timeout: 20_000,
    }
  );
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
  const response = await page.goto(
    new URL(
      "/subpath/api/fern-docs/revalidate-all/v3/",
      getProxyUrl(server)
    ).toString(),
    {
      timeout: 20_000,
    }
  );
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
  const response = await page.goto(
    new URL(
      "/subpath/api/fern-docs/revalidate-all/v4",
      getProxyUrl(server)
    ).toString(),
    {
      timeout: 10_000,
    }
  );
  expect(response).toBeDefined();
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const definedResponse = response!;
  expect(definedResponse.status()).toBe(200);

  const results = await definedResponse.json();

  expect(results.total).toBe(2);
  expect(results.results).toHaveLength(2);
  expect(
    (results.results as object[]).map((r) => "success" in r && r.success)
  ).toEqual([true, true]);
});

test("revalidate-all/v4 should work with trailing slash", async ({ page }) => {
  test.setTimeout(10_000);
  const response = await page.goto(
    new URL(
      "/subpath/api/fern-docs/revalidate-all/v4/",
      getProxyUrl(server)
    ).toString(),
    {
      timeout: 10_000,
    }
  );
  expect(response).toBeDefined();
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const definedResponse = response!;
  expect(definedResponse.status()).toBe(200);

  const results = await definedResponse.json();

  expect(results.total).toBe(2);
  expect(results.results).toHaveLength(2);
  expect(
    (results.results as object[]).map((r) => "success" in r && r.success)
  ).toEqual([true, true]);
});
