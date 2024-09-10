import { spawn } from "child_process";
import * as fs from "fs";
import * as yaml from "js-yaml";

export function getPlaywrightTestUrls(type: string): string[] {
    const testUrls: string[] = [];
    const playwrightConfig = yaml.load(fs.readFileSync("playwright/inclusions.yml", "utf-8"));

    if (!(type in playwrightConfig)) {
        throw new Error(`Test type ${type} not found in playwright/inclusions.yml`);
    }
    const testInclusions = new Set<string>(playwrightConfig[type]);

    function processLineByLineSync(filePath: string): void {
        const fileContent = fs.readFileSync(filePath, "utf-8");

        const lines = fileContent.split(/\r?\n/);

        lines.forEach((line) => {
            const urlPattern = /\(([^)]+\?host=([^&]+))\)/;
            const match = line.match(urlPattern);
            if (match) {
                const fullUrl = match[1];
                const isIncludedUrl = match[2];
                if (fullUrl && testInclusions.has(isIncludedUrl ?? "")) {
                    testUrls.push(fullUrl);
                }
            }
        });
    }

    processLineByLineSync("preview.txt");

    if (testUrls.length === 0) {
        throw new Error("No URLs found in preview.txt");
    }

    return testUrls;
}

function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function runFixture<T>(fixturePath: string, port: string, test: () => Promise<T>): Promise<T> {
    const l = spawn("playwright/run-fixture.sh", [fixturePath, port]);
    l.stdout.pipe(process.stdout);
    l.stderr.pipe(process.stderr);
    await sleep(7500);

    const result = await test();

    await sleep(500);
    const livePort = spawn("lsof", ["-i", `:${port}`, "-t"]);
    livePort.stdout.on("data", (data) => {
        data.toString()
            .split("\n")
            .forEach((pid: string) => {
                if (pid.length > 0 && Number(pid) !== process.pid) {
                    process.kill(Number(pid));
                }
            });
    });
    await sleep(500);

    return result;
}
