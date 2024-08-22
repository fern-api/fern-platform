import { expect, test } from "@playwright/test";
import * as fs from "fs";
import * as yaml from "js-yaml";

const testUrlConfigs: {
    url: string;
    isFaviconExcluded: boolean;
}[] = [];

const playwrightConfig = yaml.load(fs.readFileSync("playwright/global-exclusions.yml", "utf-8"));

const globalTestExclusions = new Set<string>(playwrightConfig["global-exclusions"]);
const faviconExclusions = new Set<string>(playwrightConfig["favicon-exclusions"]);

function processLineByLineSync(filePath: string): void {
    const fileContent = fs.readFileSync(filePath, "utf-8");

    const lines = fileContent.split(/\r?\n/);

    lines.forEach((line) => {
        const urlPattern = /\(([^)]+\?host=([^&]+))\)/;
        const match = line.match(urlPattern);
        if (match) {
            const fullUrl = match[1];
            const isExcludedUrl = match[2];
            if (fullUrl && !globalTestExclusions.has(isExcludedUrl ?? "")) {
                testUrlConfigs.push({
                    url: fullUrl,
                    isFaviconExcluded: faviconExclusions.has(isExcludedUrl ?? ""),
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
        if (testUrlConfig.isFaviconExcluded) {
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
