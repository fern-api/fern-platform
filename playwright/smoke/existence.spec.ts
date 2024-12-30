import { expect, test } from "@playwright/test";
import { getPlaywrightTestUrls } from "../utils/test-runner";
import { addPreviewCookie, generatePreviewContext } from "../utils/utils";

const existenceUrls = getPlaywrightTestUrls("existence");
existenceUrls.map(generatePreviewContext).forEach((preview) => {
    test(`Check if ${preview.originalUrl} homepage exists`, async ({ page, context }) => {
        // 1. Set the preview cookie
        await addPreviewCookie(context, preview);

        // 2. Navigate to the preview URL
        const response = await page.goto(preview.previewUrl);

        // 3. Check if the response status is 200
        expect(response?.status()).toBe(200);
    });
});
