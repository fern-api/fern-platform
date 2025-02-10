import test, { expect } from "@playwright/test";

import { getPlaywrightTestUrls } from "../utils/test-runner";
import { addPreviewCookie, generatePreviewContext } from "../utils/utils";

const faviconUrls = getPlaywrightTestUrls("favicon");
faviconUrls.map(generatePreviewContext).forEach((testUrl) => {
  test(`Check if favicon exists and URL does not return 404 for ${testUrl.originalHost}`, async ({
    page,
    context,
  }) => {
    await addPreviewCookie(context, testUrl);

    await page.goto(testUrl.previewUrl);

    const faviconUrl = await page.getAttribute('link[rel="icon"]', "href", {
      timeout: 5000,
    });

    expect(faviconUrl).not.toBeNull();

    if (faviconUrl) {
      const response = await page.goto(faviconUrl);
      expect(response?.status()).toBe(200);
    } else {
      throw new Error("Favicon link not found");
    }
  });
});
