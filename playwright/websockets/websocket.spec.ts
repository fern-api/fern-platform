import { expect, test } from "@playwright/test";
import execa from "execa";
import { generatePreviewContext } from "../utils/utils";

const target = "https://test-websocket-reference.docs.buildwithfern.com";

test.beforeAll(async () => {
    const result = await execa("fern", ["generate", "--docs"], { cwd: __dirname });
    expect(result.stdout).toContain(`Published docs to ${target}`);
});

test("websocket test", async ({ page }) => {
    const preview = generatePreviewContext(target);
    await page.goto(preview.previewUrl);
    await expect(page).toHaveScreenshot();
});
