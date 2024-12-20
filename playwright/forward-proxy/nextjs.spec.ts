import test, { expect } from "@playwright/test";
import { Server } from "http";
import { getNextServerUrl, startNextServer } from "./nextjs-proxy/start";

let server: Server;
let port: number;

// Force the tests to run on a single worker
test.describe.configure({ mode: "serial" });

test.beforeAll(async () => {
  const getPort = await import("get-port");
  port = await getPort.default();
  server = await startNextServer(port);
});

test.afterAll(async () => {
  server.close();
});

test("home page", async ({ page }) => {
  const response = await page.goto(getNextServerUrl(port));
  expect(response).toBeDefined();
  expect(response?.status()).toBe(200);

  const element = page.getByTestId("testing");
  expect(await element.textContent()).toBe("hello world");
});

test("capture the flag", async ({ page }) => {
  const response = await page.goto(
    new URL("/subpath", getNextServerUrl(port)).toString()
  );
  expect(response).toBeDefined();
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const definedResponse = response!;
  expect(definedResponse.status()).toBe(200);
  expect(await definedResponse.text()).toContain("Hello world!");

  // capture the flag
  const text = page.getByText("capture-the-flag");
  // await page.pause();
  expect(await text.count()).toBe(1);
  await text.click();

  await page.waitForURL(/(capture-the-flag)/);
  expect(await page.content()).not.toContain("Application error");
  expect(page.url()).toEqual(
    `${getNextServerUrl(port)}/subpath/capture-the-flag`
  );
  expect(await page.content()).toContain("capture_the_flag");
});

test("redirect", async ({ page }) => {
  const response = await page.goto(
    new URL("/subpath/test-capture-the-flag", getNextServerUrl(port)).toString()
  );
  expect(response).toBeDefined();
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const definedResponse = response!;
  expect(definedResponse.status()).toBe(200);
  expect(definedResponse.url()).toContain("/subpath/capture-the-flag");
});

test("404", async ({ page }) => {
  const response = await page.goto(
    new URL("/subpath/test-3", getNextServerUrl(port)).toString()
  );
  expect(response).toBeDefined();
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const definedResponse = response!;
  expect(definedResponse.status()).toBe(404);
});

test("client-side navigation", async ({ page }) => {
  const requests: string[] = [];
  page.on("request", (req) => {
    if (req.url().includes("/_next/static")) {
      requests.push(req.url());
    }
  });
  await page.goto(new URL("/subpath", getNextServerUrl(port)).toString());
  const sidebarLink = await page.$("a[href='/subpath/capture-the-flag']");
  expect(sidebarLink).toBeDefined();
  await sidebarLink?.click();
  await page.waitForURL(/(capture-the-flag)/);

  const uniqueRequests = [...new Set(requests)];

  expect(requests.length).toBe(uniqueRequests.length);
});
