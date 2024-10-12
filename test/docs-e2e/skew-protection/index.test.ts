import { chromium, Request } from "playwright";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { getDeploymentOrigin } from "../../utils/deployment-url";

const origin = getDeploymentOrigin();

describe("skew-protection", () => {
    let browser: Awaited<ReturnType<typeof chromium.launch>>;

    beforeAll(async () => {
        browser = await chromium.launch();
    });

    afterAll(async () => {
        await browser?.close();
    });

    let page: Awaited<ReturnType<typeof browser.newPage>>;
    beforeEach(async () => {
        page = await browser.newPage();
        await page.context().addCookies([
            {
                name: "_fern_docs_preview",
                value: "buildwithfern.com",
                domain: origin,
                path: "/",
            },
        ]);
    });

    afterEach(async () => {
        await page.close();
    });

    it("should contain ?dpl= or x-deployment-id header on all scripts and prefetch requests", async () => {
        const requests: Request[] = [];
        page.on("request", async (request) => {
            requests.push(request);
        });

        await page.goto(`${origin}/learn/home`);

        const scripts = await page.locator("script").all();
        expect(scripts.length).toBeGreaterThan(0);

        let nextScripts = 0;
        let dpl: string | undefined = undefined;
        for (const script of scripts) {
            const src = await script.getAttribute("src");

            if (src?.includes("/_next/")) {
                nextScripts++;
                expect(src).toContain("dpl=dpl_");
                if (dpl === undefined) {
                    dpl = src.split("dpl=")[1];
                }
            }
        }

        expect(nextScripts).toBeGreaterThan(0);
        expect(dpl).not.toBeUndefined();

        // Prefetch a page
        await page.evaluate(async () => {
            await window.next.router.prefetch("/learn/docs/getting-started/development");
        });

        const allPrefetchHeaders = (await Promise.all(requests.map((req) => req.allHeaders()))).filter(
            (headers) => headers["x-nextjs-data"] === "1",
        );
        expect(allPrefetchHeaders.length).toBeGreaterThan(0);
        expect(allPrefetchHeaders.every((headers) => headers["x-deployment-id"] === dpl)).toBe(true);
    });
}, 20_000);
