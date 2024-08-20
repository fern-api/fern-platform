import { expect, test } from "@playwright/test";
import * as fs from "fs";

const urls: string[] = [];

function processLineByLineSync(filePath: string): void {
    const fileContent = fs.readFileSync(filePath, "utf-8");

    const lines = fileContent.split(/\r?\n/);

    lines.forEach((line) => {
        const urlPattern = /\(([^)]+)\)/;
        const match = line.match(urlPattern);
        if (match) {
            const fullUrl = match[1];
            if (fullUrl) {
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
        const response = await page.goto(url);
        expect(response?.status()).toBe(200);
    });

    test(`Check if favicon exists and URL does not return 404 for ${url}`, async ({ page }) => {
        await page.goto(url);

        const faviconUrl = await page.getAttribute('link[rel="icon"]', "href");
        expect(faviconUrl).not.toBeNull();

        if (faviconUrl) {
            const [response] = await Promise.all([
                page.waitForResponse((response) => response.url() === faviconUrl && response.status() === 200),
                page.goto(faviconUrl),
            ]);

            expect(response.status()).toBe(200);
        } else {
            throw new Error("Favicon link not found");
        }
    });
});
