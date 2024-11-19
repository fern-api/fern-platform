import { ParsedBlock } from "./ParsedBlock";

export interface ParseResult {
    header: string;
    blocks: ParsedBlock[];
}
export class ReadmeParser {
    public parse({ content }: { content: string }): ParseResult {
        let header: string = "";
        let currentBlock: ParsedBlock | undefined;
        const blocks: ParsedBlock[] = [];
        const lines = content.split("\n");
        for (const line of lines) {
            const h2Match = getH2Match(line);
            if (h2Match) {
                if (currentBlock) {
                    blocks.push(currentBlock);
                }
                currentBlock = new ParsedBlock({
                    sectionName: h2Match[1] ?? "",
                    content: "",
                });
            }
            if (currentBlock == null) {
                header += line;
                continue;
            }
            currentBlock.content += line + "\n";
        }
        if (currentBlock) {
            blocks.push(currentBlock);
        }
        return {
            header,
            blocks,
        };
    }
}

function getH2Match(line: string): RegExpMatchArray | null {
    return line.match(/^##\s+(.*)/);
}
