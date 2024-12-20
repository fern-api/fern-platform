import { expect, test } from "@playwright/test";
import { addPreviewCookie, generatePreviewContext } from "../utils/utils";

/**
 * This test will run on a sample of urls from customer docs using versions.
 *
 * ### Coverage
 *
 * types of docs pages:
 *
 * - markdown guide pages
 * - api pages
 * - changelog pages
 *
 * from the following categories:
 *
 * - default version (canonical, i.e. https://docs.flagright.com/)
 * - default version (non-canonical, i.e. https://docs.flagright.com/framl-api)
 * - non-default version (i.e. https://docs.flagright.com/management-api)
 *
 * across 3 customer sites that use versions:
 *
 * - primer
 * - flagright
 * - humanloop
 *
 */

const samples = [
    "https://humanloop.com/docs/v5/getting-started/overview",
    "https://humanloop.com/docs/v5/api-reference",
    "https://primer.io/docs/api/v2.2/introduction/getting-started",
    "https://primer.io/docs/api/v2.1/api-reference/client-session-api/retrieve-client-side-token",
    "https://docs.flagright.com/guides/overview/introduction",
    "https://docs.flagright.com/framl-api/guides/overview/introduction",
    "https://docs.flagright.com/framl-api/api-reference/webhooks/user/user-state-update",
    "https://docs.flagright.com/management-api/api-reference/api-reference/get-rules",
].map(generatePreviewContext);

samples.forEach((sample) => {
    test(`Check if ${sample.originalUrl} is online`, async ({ page, context }) => {
        // 1. set the preview cookie
        await addPreviewCookie(context, sample);

        // 2. navigate to the page and check if it is online
        const response = await page.goto(sample.previewUrl, { waitUntil: "domcontentloaded" });
        expect(response?.status()).toBe(200);

        // 3. check if the version dropdown is present
        const versionDropdown = page.getByTestId("version-dropdown");
        await versionDropdown.click();

        // 4. collect all links from the version dropdown
        const versionDropdownContent = page.getByTestId("version-dropdown-content");
        await versionDropdownContent.waitFor({ state: "attached" });
        const options = await versionDropdownContent.getByRole("menuitemradio", { checked: false }).all();
        expect(options.length).toBeGreaterThan(0);

        // 5. check if all links are online
        const hrefs = await Promise.all(options.map((option) => option.getAttribute("href")));
        for (const href of hrefs) {
            expect(href).not.toBeNull();
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const url = sample.createPreviewUrl(href!);
            const response = await page.goto(url);
            expect(response?.status()).toBe(200);
        }
    });
});
