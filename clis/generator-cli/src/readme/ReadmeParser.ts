import { snakeCase } from "lodash-es";
import { Block } from "./Block";

export interface ParseResult {
    header: string;
    blocks: Block[];
}

export class ReadmeParser {
    public parse({ content }: { content: string }): ParseResult {
        let header: string = "";
        let currentBlock: Block | undefined;
        const blocks: Block[] = [];
        const lines = content.split("\n");
        for (const line of lines) {
            const h2Match = line.match(/^##\s+(.*)/);
            if (h2Match) {
                if (currentBlock) {
                    blocks.push(currentBlock);
                }
                currentBlock = new Block({
                    id: sectionNameToID(h2Match[1] ?? ""),
                    content: "",
                });
            }
            if (currentBlock == null) {
                header += line;
                continue;
            }
            currentBlock.content += line + "\n";
        }
        return {
            header,
            blocks,
        };
    }
}

function sectionNameToID(sectionName: string): string {
    return snakeCase(
        sectionName
            .split(" ")
            .map((word, index) => {
                if (index === 0) {
                    return word;
                }
                return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
            })
            .join(""),
    ).toUpperCase();
}
