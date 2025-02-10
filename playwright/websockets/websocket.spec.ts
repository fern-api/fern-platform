import { expect, test } from "@playwright/test";

import { addPreviewCookie, generatePreviewContext } from "../utils/utils";

const target = "https://test-websocket-reference.docs.buildwithfern.com";

test.beforeAll(async () => {
  // const result = await execa("fern", ["generate", "--docs"], { cwd: __dirname });
  // expect(result.stdout).toContain(`Published docs to ${target}`);
});

// skipping because it's flaky and needs to be rewritten
test.skip("websocket test", async ({ page, context }) => {
  const preview = generatePreviewContext(target);
  await addPreviewCookie(context, preview);
  await page.goto(preview.previewUrl);
  await expect(page).toHaveScreenshot({
    maxDiffPixels: 50,
  });
});
