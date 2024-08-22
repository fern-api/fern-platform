import { expect, test } from "@playwright/test";
import * as fs from "fs";
import * as yaml from "js-yaml";

const urls: string[] = [];
const exclusions = new Set<string>(yaml.load(fs.readFileSync("playwright/global-exclusions.yml", "utf-8")).exclusions);

function processLineByLineSync(filePath: string): void {
    const fileContent = fs.readFileSync(filePath, "utf-8");

    const lines = fileContent.split(/\r?\n/);

    lines.forEach((line) => {
        const urlPattern = /\(([^)]+\?host=([^&]+))\)/;
        const match = line.match(urlPattern);
        if (match) {
            const fullUrl = match[1];
            const isExcludedUrl = match[2];
            if (fullUrl && !exclusions.has(isExcludedUrl ?? "")) {
                urls.push(fullUrl);
            }
        }
    });
}

processLineByLineSync("preview.txt");

if (urls.length === 0) {
    throw new Error("No URLs found in preview.txt");
}

urls.forEach((url) => {
    test(`Check if ${url} is online`, async ({ page }) => {
        const response = await page.goto(url, {
            timeout: 5000,
        });
        expect(response?.status()).toBe(200);
    });

    test(`Check if favicon exists and URL does not return 404 for ${url}`, async ({ page }) => {
        await page.goto(url, {
            timeout: 5000,
        });

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
