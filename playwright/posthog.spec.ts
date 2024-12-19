import { expect, test, type Page } from "@playwright/test";

test.skip("Posthog loads successfully", () => {
    /**
     * This function should receive a docs page with posthog configured by the customer
     * @param page
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async function posthogLoads(page: Page) {
        const [fernPosthogExists, customerPosthogExists] = await page.evaluate(
            () => [Boolean(window.posthog), Boolean(window.posthog.customer)]
        );

        expect(fernPosthogExists).toBeTruthy();
        expect(customerPosthogExists).toBeTruthy();
    }
});
