import { expect, test } from "@playwright/test";
import * as fs from "fs";
import * as yaml from "js-yaml";

const testUrlConfigs: {
    url: string;
    isFaviconIncluded: boolean;
}[] = [];

const playwrightConfig = yaml.load(fs.readFileSync("playwright/global-inclusions.yml", "utf-8"));

const globalTestInclusions = new Set<string>(playwrightConfig["global-inclusions"]);
const faviconInclusions = new Set<string>(playwrightConfig["favicon-inclusions"]);

function processLineByLineSync(filePath: string): void {
    const fileContent = fs.readFileSync(filePath, "utf-8");

    const lines = fileContent.split(/\r?\n/);

    lines.forEach((line) => {
        const urlPattern = /\(([^)]+\?host=([^&]+))\)/;
        const match = line.match(urlPattern);
        if (match) {
            const fullUrl = match[1];
            const isIncludedUrl = match[2];
            if (fullUrl && globalTestInclusions.has(isIncludedUrl ?? "")) {
                testUrlConfigs.push({
                    url: fullUrl,
                    isFaviconIncluded: faviconInclusions.has(isIncludedUrl ?? ""),
                });
            }
        }
    });
}

processLineByLineSync("preview.txt");

if (testUrlConfigs.length === 0) {
    throw new Error("No URLs found in preview.txt");
}

testUrlConfigs.forEach((testUrlConfig) => {
    test(`Check if ${testUrlConfig.url} is online`, async ({ page }) => {
        const response = await page.goto(testUrlConfig.url);
        expect(response?.status()).toBe(200);
    });

    test(`Check if favicon exists and URL does not return 404 for ${testUrlConfig.url}`, async ({ page }) => {
        if (!testUrlConfig.isFaviconIncluded) {
            return;
        }

        await page.goto(testUrlConfig.url);

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
