/* eslint-disable no-console */
import * as child_process from "child_process";
import * as fs from "fs";
import * as path from "path";
import * as util from "util";

// Promisify functions for async/await usage
const copyFile = util.promisify(fs.copyFile);
const readdir = util.promisify(fs.readdir);
const mkdir = util.promisify(fs.mkdir);
const stat = util.promisify(fs.stat);
const exec = util.promisify(child_process.exec);

const inputFolder = "/Users/catherinedeskur/Documents/Fern/studio/cohere/notebooks";
const outputFolder = "/Users/catherinedeskur/Documents/Fern/fern-platform/clis/jupyter-to-mdx/output";

async function convertIpynbToMarkdown(filePath: string, outputFilePath: string): Promise<void> {
    const outputDir = path.dirname(outputFilePath);
    if (!fs.existsSync(outputDir)) {
        await mkdir(outputDir, { recursive: true });
    }
    const cmd = `jupyter nbconvert --to markdown "${filePath}" --output "${outputFilePath}"`;
    await exec(cmd);
}

async function copyAndConvertFiles(inputDir: string, outputDir: string): Promise<void> {
    // Create output directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
        await mkdir(outputDir, { recursive: true });
    }

    const items = await readdir(inputDir);

    for (const item of items) {
        const inputItemPath = path.join(inputDir, item);
        const outputItemPath = path.join(outputDir, item);

        if (inputItemPath.includes(".git")) {
            // Skip .git directories
            continue;
        }

        try {
            const itemStat = await stat(inputItemPath);

            if (itemStat.isDirectory()) {
                // Recursively copy subdirectories
                await copyAndConvertFiles(inputItemPath, outputItemPath);
            } else if (path.extname(item) === ".ipynb") {
                // Convert .ipynb files to markdown
                const outputMdPath = outputItemPath.replace(/\.ipynb$/, ".md");
                await convertIpynbToMarkdown(inputItemPath, outputMdPath);
            } else {
                // Copy other files
                await copyFile(inputItemPath, outputItemPath);
            }
        } catch (error: unknown) {
            if (error) {
                console.error(`Error processing ${inputItemPath}:`, error);
            }
        }
    }
}

async function main() {
    try {
        await copyAndConvertFiles(inputFolder, outputFolder);
        console.log("All files copied and .ipynb files converted to markdown.");
    } catch (error) {
        console.error("Error:", error);
    }
}

void main();
