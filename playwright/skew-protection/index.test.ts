import test, { expect, Request } from "@playwright/test";
import { getPreviewDeploymentUrl } from "../utils/utils";

const origin = getPreviewDeploymentUrl();

test("should contain ?dpl= or x-deployment-id header on all scripts and prefetch requests", async ({
    page,
    context,
}) => {
    await context.addCookies([{ name: "_fern_docs_preview", url: origin, value: "buildwithfern.com" }]);

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

    await page.waitForSelector("a");

    const requests: Request[] = [];
    page.on("request", async (request) => {
        requests.push(request);
    });

    const link = await page.$("a[href^='/learn/']");
    expect(link).not.toBeNull();

    await link?.hover();

    await page.waitForTimeout(10_000);

    const allPrefetchHeaders = (await Promise.all(requests.map((req) => req.allHeaders()))).filter(
        (headers) => headers["x-nextjs-data"] === "1",
    );
    expect(allPrefetchHeaders.length).toBeGreaterThan(0);
    expect(allPrefetchHeaders.every((headers) => headers["x-deployment-id"] === dpl)).toBe(true);
});
