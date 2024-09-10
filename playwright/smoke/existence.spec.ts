import { expect, test } from "@playwright/test";
import { getPlaywrightTestUrls } from "../test-runner";

const existenceUrls = getPlaywrightTestUrls("existence");
existenceUrls.forEach((testUrl) => {
    test(`Check if ${testUrl} is online`, async ({ page }) => {
        const response = await page.goto(testUrl);
        expect(response?.status()).toBe(200);
    });
});
