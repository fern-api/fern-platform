import test, { expect } from "@playwright/test";
import { runFixture } from "../test-runner";

const port = "6983";
test("Check CSS variable values", async ({ page }) => {
    const computedStyles = await runFixture("stylesheet", port, async () => {
        await page.goto(`localhost:${port}`);

        const element = page.locator("body");
        return await element.evaluate((el) => {
            const styles = window.getComputedStyle(el);
            return {
                backgroundColor: styles.getPropertyValue("--background"),
            };
        });
    });
    expect(computedStyles.backgroundColor.trim()).toBe("51, 0, 0");
});
