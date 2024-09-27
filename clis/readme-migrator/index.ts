/* eslint-disable @typescript-eslint/no-floating-promises */
import * as fs from "fs";
import * as path from "path";
import * as readline from "readline";

const urlPattern = /<[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_+.~#?&//=]*)>/g;
const imagePattern =
    /https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9]{1,6}\b(?:[-a-zA-Z0-9@:%_+.~#?&/=]*)/g;
const altPattern = /^\s*"([^:]+)"$/g;
const linkPattern = /link_url: \"([^"]+)\"/g;

async function ensureImagesFolder(): Promise<void> {
    const imagesFolder = path.resolve(`${__dirname}/assets`, "images");

    if (!fs.existsSync(imagesFolder)) {
        try {
            await fs.promises.mkdir(imagesFolder);
        } catch (err) {
            console.error("Failed to make images folder");
        }
    }
}

async function downloadImage(url: string): Promise<void> {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch image from ${url}: ${response.statusText}`);
        }

        const arrBuff = await response.arrayBuffer();
        const buffer = Buffer.from(arrBuff);
        const imgPath = path.join("assets/images", path.basename(url));
        await fs.promises.writeFile(imgPath, new Uint8Array(buffer));
    } catch (err) {}
}

async function downloadImages(line: string, levelIn: number): Promise<string> {
    let pathExtend = "";
    for (let i = 0; i < levelIn; i++) {
        pathExtend += "../";
    }

    ensureImagesFolder();

    const matches = line.match(imagePattern);
    if (matches) {
        for (const link of matches) {
            await downloadImage(link);
        }
        return line.replace("https://files.readme.io", `${pathExtend}../assets/images`);
    }
    return line;
}

interface BlockParameters {
    data: { [key: string]: string };
    cols: number;
    rows: number;
    align: string[];
}

async function paramsToTable(block: BlockParameters): Promise<string> {
    const headers = [];
    const rows = [];

    for (let i = 0; i < block.cols; i++) {
        headers.push(block.data[`h-${i}`]);
    }

    for (let r = 0; r < block.rows; r++) {
        const row = [];
        for (let c = 0; c < block.cols; c++) {
            row.push(block.data[`${r}-${c}`]);
        }
        rows.push(row);
    }

    const table = [];

    table.push(`| ${headers.join(" | ")} |`);

    const alignments = block.align.map(() => ":--").join(" | ");
    table.push(`| ${alignments} |`);

    rows.forEach((row) => {
        table.push(`| ${row.join(" | ")} |`);
    });

    return table.join("\n");
}

async function convertToMarkdown(
    content: string[],
    levelIn: number,
    navigation: string,
): Promise<[string, string, boolean]> {
    const tabbed = "  ".repeat(3 + levelIn * 2);
    let markdown = "";
    let collectingFrontmatter = false;
    let frontmatter = "";
    let collectingImage = false;
    let imageData = "";
    let isFrame = false;
    let collectingHtml = false;
    let collectingCode = false;
    let collectingParams = false;
    let checkEnd = false;
    let multiblock = false;
    let collectingCallout = false;
    let calloutCloser = "";
    let codeData: string[] = [];
    let paramData = "";

    for (const line of content) {
        let newline = line;

        if (newline === "---") {
            if (collectingFrontmatter) {
                if (frontmatter.includes("metadata")) {
                    frontmatter = frontmatter.replace("metadata:", "");
                    frontmatter = frontmatter.replaceAll(/  (\S*): (.*)/g, "og:$1: $2");
                    frontmatter = frontmatter.replace("  image: []", "");
                }

                frontmatter = frontmatter.replace("excerpt:", "description:");

                const link_url = frontmatter.match(linkPattern);
                if (link_url) {
                    navigation += `${tabbed}- link: ${frontmatter.split("\n")[1]?.split(":")[1]?.trim().replaceAll('"', "")}\n${tabbed}  href: ${link_url[0].replace(/link_url: \"([^"]+)\"/g, "$1")}\n`;

                    if (frontmatter.includes("hidden")) {
                        if (frontmatter.includes("hidden: true")) {
                            navigation += `${tabbed}  hidden: true\n`;
                        }
                    }

                    markdown += frontmatter;
                    collectingFrontmatter = false;

                    return [markdown, navigation, false];
                } else {
                    navigation += `${tabbed}- page: ${frontmatter.split("\n")[1]?.split(":")[1]?.trim().replaceAll('"', "")}\n`;
                }

                if (frontmatter.includes("hidden")) {
                    if (frontmatter.includes("hidden: true")) {
                        navigation += `${tabbed}  hidden: true\n`;
                    }
                }

                markdown += frontmatter;
                collectingFrontmatter = false;
            } else {
                collectingFrontmatter = true;
                frontmatter += newline + "\n";
                continue;
            }
        }

        if (collectingFrontmatter) {
            if (newline.includes("createdAt") || newline.includes("updatedAt") || newline.includes("robots")) {
                continue;
            }

            frontmatter += newline + "\n";
            continue;
        }

        if (newline.includes("[block:image]")) {
            collectingImage = true;
            imageData += "<img ";
            continue;
        }

        if (newline.includes("[block:html]")) {
            collectingHtml = true;
            continue;
        }

        if (newline.includes("[block:parameters]")) {
            collectingParams = true;
            continue;
        }

        if (newline.includes("[/block]")) {
            if (collectingImage) {
                collectingImage = false;
                imageData += "/>\n";

                if (isFrame) {
                    imageData += "</Frame>\n";
                    isFrame = false;
                }

                markdown += imageData;
                imageData = "";
            } else if (collectingHtml) {
                collectingHtml = false;
            } else if (collectingParams) {
                collectingParams = false;
                markdown += await paramsToTable(JSON.parse(paramData));
                paramData = "";
            }

            continue;
        }

        if (newline.includes("<br>")) {
            newline = newline.replaceAll("<br>", "<br />");
        }

        if (newline.includes("</br>")) {
            newline = newline.replaceAll("</br>", "<br />");
        }

        if (collectingImage) {
            const matches = newline.match(imagePattern);
            const alt = newline.match(altPattern);

            if (matches) {
                newline = `src='${matches[0]}' `;

                if (newline.includes("files.readme.io")) {
                    newline = await downloadImages(line, levelIn);
                }

                imageData += newline;
            } else if (newline.includes("caption")) {
                imageData =
                    `<Frame caption="${newline.replace('"caption": "', "").slice(0, -1).trim().replaceAll('\\"', "'")}">\n` +
                    imageData;

                isFrame = true;
            } else if (alt) {
                imageData += `alt="${alt[0].trim().replace('"', "").slice(0, -1).replaceAll('\\"', "'")}" `;
            } else if (newline.includes("sizing")) {
                imageData += `width="${newline.replace('"sizing": "', "").slice(0, -2).trim()}" `;
            }
            continue;
        }

        if (newline.includes("files.readme.io")) {
            newline = await downloadImages(line, levelIn);
        }

        if (collectingHtml) {
            if (newline.includes("html")) {
                markdown +=
                    newline
                        .trim()
                        .replace('"html": "', "")
                        .replaceAll("\\n", "")
                        .replaceAll('\\"', '"')
                        .slice(0, -1)
                        .replaceAll(/<!--.*-->/g, "")
                        .replaceAll(/<style>.*<\/style>/g, "") + "\n";
            }
            continue;
        }

        if (collectingParams) {
            paramData += newline.replaceAll("\\n", "<br />");
            continue;
        }

        if (newline.includes("files.readme.io")) {
            newline = await downloadImages(line, levelIn);
        }

        if (newline.match(/```(\S+)/)) {
            if (!collectingCode) {
                collectingCode = true;
            } else {
                checkEnd = false;
                multiblock = true;
            }
            codeData.push(newline + "\n");
            continue;
        } else if (newline === "```") {
            checkEnd = true;
            codeData.push(newline + "\n");
            continue;
        } else if (checkEnd) {
            if (multiblock) {
                markdown += "<CodeBlocks>\n";
                codeData.push("</CodeBlocks>\n");
            }
            markdown += codeData.join("");
            collectingCode = false;
            multiblock = false;
            checkEnd = false;
            codeData = [];
            markdown += newline + "\n";
            continue;
        } else if (collectingCode) {
            codeData.push(newline + "\n");
            continue;
        }

        const links = newline.match(urlPattern);
        if (links) {
            for (const match of links) {
                const link = match.replace("<", "").replace(">", "");
                newline = newline.replace(match, `[${link}](${link})`);
            }
        }

        if (collectingCallout) {
            if (newline.match(/^\s*>/)) {
                newline = newline.replace(">", "");
            } else {
                collectingCallout = false;
                markdown += calloutCloser;
            }
        }

        const calloutMatch = newline.match(/> \[!(\S+)\]/);
        if (calloutMatch) {
            collectingCallout = true;
            newline = newline
                .replace(/> \[!(\S+)\]/, `<${calloutMatch[1]}>\n`)
                .toLowerCase()
                .replace(/^\w/, (c) => c.toUpperCase());
            calloutCloser = newline.replace("<", "</");
        } else {
            const noteMatch = newline.match(/> (📘|ℹ️)/);
            const checkMatch = newline.match(/> (👍|✅)/);
            const infoMatch = newline.match(/> (🚧|⚠️)/);
            const warningMatch = newline.match(/> (❗️|🛑)/);

            if (noteMatch) {
                collectingCallout = true;
                newline = newline.replace(/> (?:\S*) (\S+.*)/, '<Note title="$1">\n');
                calloutCloser = "</Note>\n";
            } else if (checkMatch) {
                collectingCallout = true;
                newline = newline.replace(/> (?:\S*) (\S+.*)/, '<Check title="$1">\n');
                calloutCloser = "</Check>\n";
            } else if (infoMatch) {
                collectingCallout = true;
                newline = newline.replace(/> (?:\S*) (\S+.*)/, '<Info title="$1">\n');
                calloutCloser = "</Info>\n";
            } else if (warningMatch) {
                collectingCallout = true;
                newline = newline.replace(/> (?:\S*) (\S+.*)/, '<Warning title="$1">\n');
                calloutCloser = "</Warning>\n";
            } else if (newline.match(/> \*\*.\*\*/)) {
                newline = newline
                    .replace(/> \*\*(.)\*\*/, "> $1\n")
                    .toLowerCase()
                    .replace(/^\w/, (c) => c.toUpperCase());
            }
        }

        markdown += newline + "\n";
    }

    if (checkEnd) {
        if (multiblock) {
            markdown += "<CodeBlocks>\n";
            codeData.push("</CodeBlocks>\n");
        }
        markdown += codeData.join("");
    }

    return [markdown, navigation, true];
}

function saveMarkdownFile(markdownContent: string, filePath: string): void {
    try {
        fs.writeFileSync(filePath, markdownContent);
    } catch (err) {
        let message = "Unknown Error";
        if (err instanceof Error) message = err.message;
        console.error(`An error occurred while saving the markdown file: ${message}`);
    }
}

async function promptUser(folderName: string): Promise<boolean> {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        terminal: false,
    });

    return new Promise((resolve) => {
        rl.question(`Do you want to copy the contents of the folder "${folderName}"? (y/n): `, (answer) => {
            rl.close();
            resolve(answer.trim().toLowerCase() === "y");
        });
    });
}

async function copyAndConvertToMdx(
    srcFolder: string,
    dstFolder: string,
    levelIn: number,
    navigation: string,
): Promise<string> {
    try {
        if (!fs.existsSync(dstFolder)) {
            fs.mkdirSync(dstFolder);
        }

        const items = fs.readdirSync(srcFolder);
        for (const item of items) {
            const srcPath = path.join(srcFolder, item);
            if (fs.lstatSync(srcPath).isFile() && !item.startsWith(".")) {
                const dstPath = path.join(dstFolder, path.parse(item).name + ".mdx");
                let content: string[] = [];
                try {
                    content = fs.readFileSync(srcPath, "utf-8").split("\n");
                } catch (err) {
                    let message = "Unknown Error";
                    if (err instanceof Error) message = err.message;
                    console.error(`An error occurred while reading the file: ${message}`);
                }
                const markdownReturn = await convertToMarkdown(content, levelIn, navigation);
                navigation = markdownReturn[1];
                if (markdownReturn[2]) {
                    navigation += `${"  ".repeat(3 + levelIn * 2)}  path: ${dstPath}\n`;
                }
                saveMarkdownFile(markdownReturn[0], dstPath);
            } else if (fs.lstatSync(srcPath).isDirectory()) {
                const nestedDstFolder = path.join(dstFolder, item);
                navigation += `${"  ".repeat(3 + levelIn * 2)}- section: ${item}\n${"  ".repeat(3 + levelIn * 2)}  contents:\n`;
                navigation = await copyAndConvertToMdx(srcPath, nestedDstFolder, levelIn + 1, navigation);
            }
        }
    } catch (err) {
        let message = "Unknown Error";
        if (err instanceof Error) message = err.message;
        console.error(`Failed to copy contents of "${srcFolder}": ${message}`);
    }

    return navigation;
}

function askQuestion(query: string): Promise<string> {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return new Promise((resolve) => rl.question(query, resolve));
}

(async () => {
    const answer = await askQuestion("File name: ");
    const folderPath = path.resolve(answer);
    let navigation = "navigation:\n";

    try {
        if (!fs.existsSync(folderPath) || !fs.lstatSync(folderPath).isDirectory()) {
            throw new Error(`${folderPath} is not a valid directory.`);
        }

        fs.mkdirSync(`pages`);
        fs.mkdirSync(`assets`);

        const items = fs.readdirSync(folderPath);
        for (const item of items) {
            const itemPath = path.join(folderPath, item);
            if (fs.lstatSync(itemPath).isDirectory()) {
                if (await promptUser(item)) {
                    navigation += `  - section: ${item}\n    contents:\n`;
                    navigation = await copyAndConvertToMdx(itemPath, `pages/${item.replace(" ", "_")}`, 0, navigation);
                }
            }
        }

        try {
            fs.writeFileSync("docs.yml", navigation);
        } catch (err) {
            let message = "Unknown Error";
            if (err instanceof Error) message = err.message;
            console.error(`An error occurred while saving the navigation file: ${message}`);
        }
    } catch (err) {
        let message = "Unknown Error";
        if (err instanceof Error) {
            message = err.message;
        }
        console.error(`An error occurred: ${message}`);
    }
})();
