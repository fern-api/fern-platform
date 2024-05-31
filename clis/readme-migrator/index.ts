import * as fs from "fs";
import * as https from "https";
import * as path from "path";
import * as readline from "readline";

const urlPattern = /<[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&//=]*)>/g;
const imagePattern =
    /https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9]{1,6}\b(?:[-a-zA-Z0-9@:%_\+.~#?&\/=]*)/g;

function downloadImage(line: string, levelIn: number): string {
    let pathExtend = "";
    for (let i = 0; i < levelIn; i++) {
        pathExtend += "../";
    }

    if (!fs.existsSync("images")) {
        fs.mkdirSync("images");
    }
    const matches = line.match(imagePattern);
    if (matches) {
        for (const link of matches) {
            https.get(link, (res) => {
                const imgPath = path.join("images", path.basename(link));
                const file = fs.createWriteStream(imgPath);
                res.pipe(file);
            });
        }
        return line.replace("https://files.readme.io", `${pathExtend}../assets/images`);
    }
    return line;
}

function convertToMarkdown(content: string[], levelIn: number): string {
    let markdown = "";
    let collectingImage = false;
    let collectingCode = false;
    let checkEnd = false;
    let multiblock = false;
    let collectingCallout = false;
    let calloutCloser = "";
    let codeData: string[] = [];

    for (let line of content) {
        let newline = line + "\n";

        if (line.includes("[block:image]")) {
            collectingImage = true;
            markdown += "<img ";
            continue;
        }

        if (line.includes("[/block]")) {
            collectingImage = false;
            markdown += "/>\n";
            continue;
        }

        if (collectingImage) {
            const matches = line.match(imagePattern);
            if (matches) {
                newline = `src='${matches[0]}' `;
                if (newline.includes("files.readme.io")) {
                    newline = downloadImage(newline, levelIn);
                }
                markdown += newline;
            } else if (line.includes("caption")) {
                let caption = line.split(" ").slice(-1)[0];
                if (caption) markdown += `alt='${caption.replace('"', "")}' `;
            }
            continue;
        }

        if (line.includes("files.readme.io")) {
            newline = downloadImage(line, levelIn);
        }

        if (line.match(/```(\S+)/)) {
            if (!collectingCode) {
                collectingCode = true;
            } else {
                checkEnd = false;
                multiblock = true;
            }
            newline = line.replace(/```(\S+) (\S+.*)/, "```$1 title='$2'");
            codeData.push(newline);
            continue;
        } else if (line === "```\n") {
            checkEnd = true;
            codeData.push(line);
            continue;
        } else if (checkEnd) {
            if (multiblock) {
                markdown += "<CodeBlocks>\n";
                codeData.push("</CodeBlocks>\n");
            }
            markdown += codeData.join("");
            collectingCode = false;
            multiblock = false;
            codeData = [];
        } else if (collectingCode) {
            codeData.push(line);
            continue;
        }

        const links = line.match(urlPattern);
        if (links) {
            for (const match of links) {
                const link = match.replace("<", "").replace(">", "");
                newline = newline.replace(match, `[${link}](${link})`);
            }
        }

        if (collectingCallout) {
            if (line.match(/^\s*>/)) {
                newline = newline.replace(">", "");
            } else {
                collectingCallout = false;
                markdown += calloutCloser;
            }
        }

        const calloutMatch = line.match(/> \[!(\S+)\]/);
        if (calloutMatch) {
            collectingCallout = true;
            newline = line
                .replace(/> \[!(\S+)\]/, `<${calloutMatch[1]}>\n`)
                .toLowerCase()
                .replace(/^\w/, (c) => c.toUpperCase());
            calloutCloser = newline.replace("<", "</");
        } else {
            const noteMatch = line.match(/> (📘|ℹ️)/);
            const checkMatch = line.match(/> (👍|✅)/);
            const infoMatch = line.match(/> (🚧|⚠️)/);
            const warningMatch = line.match(/> (❗️|🛑)/);

            if (noteMatch) {
                collectingCallout = true;
                newline = line.replace(/> (?:.) (\S+.*)/, "<Note title='$1'>\n");
                calloutCloser = "</Note>\n";
            } else if (checkMatch) {
                collectingCallout = true;
                newline = line.replace(/> (?:.) (\S+.*)/, "<Check title='$1'>\n");
                calloutCloser = "</Check>\n";
            } else if (infoMatch) {
                collectingCallout = true;
                newline = line.replace(/> (?:.) (\S+.*)/, "<Info title='$1'>\n");
                calloutCloser = "</Info>\n";
            } else if (warningMatch) {
                collectingCallout = true;
                newline = line.replace(/> (?:.) (\S+.*)/, "<Warning title='$1'>\n");
                calloutCloser = "</Warning>\n";
            } else if (line.match(/> \*\*.\*\*/)) {
                newline = line
                    .replace(/> \*\*(.)\*\*/, "> $1\n")
                    .toLowerCase()
                    .replace(/^\w/, (c) => c.toUpperCase());
            }
        }

        markdown += newline;
    }

    if (checkEnd) {
        if (multiblock) {
            markdown += "<CodeBlocks>\n";
            codeData.push("</CodeBlocks>\n");
        }
        markdown += codeData.join("");
    }

    return markdown;
}

function saveMarkdownFile(markdownContent: string, filePath: string): void {
    try {
        fs.writeFileSync(filePath, markdownContent);
        console.log(`Markdown content saved to ${filePath}`);
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
        rl.question(`Do you want to copy the contents of the folder '${folderName}'? (y/n): `, (answer) => {
            rl.close();
            resolve(answer.trim().toLowerCase() === "y");
        });
    });
}

async function copyAndConvertToMdx(srcFolder: string, dstFolder: string, levelIn: number): Promise<void> {
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
                const markdownContent = convertToMarkdown(content, levelIn);
                saveMarkdownFile(markdownContent, dstPath);
                console.log(`Copied '${srcPath}' to '${dstPath}'`);
            } else if (fs.lstatSync(srcPath).isDirectory()) {
                if (await promptUser(item)) {
                    const nestedDstFolder = path.join(dstFolder, item);
                    await copyAndConvertToMdx(srcPath, nestedDstFolder, levelIn + 1);
                }
            }
        }
    } catch (err) {
        let message = "Unknown Error";
        if (err instanceof Error) message = err.message;
        console.error(`Failed to copy contents of '${srcFolder}': ${message}`);
    }
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

    try {
        if (!fs.existsSync(folderPath) || !fs.lstatSync(folderPath).isDirectory()) {
            throw new Error(`${folderPath} is not a valid directory.`);
        }

        const items = fs.readdirSync(folderPath);
        for (const item of items) {
            const itemPath = path.join(folderPath, item);
            if (fs.lstatSync(itemPath).isDirectory()) {
                if (await promptUser(item)) {
                    await copyAndConvertToMdx(itemPath, "pages", 0);
                }
            }
        }
    } catch (err) {
        let message = "Unknown Error";
        if (err instanceof Error) message = err.message;
        console.error(`An error occurred: ${message}`);
    }
})();
