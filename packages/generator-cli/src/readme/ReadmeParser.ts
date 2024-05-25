import { Block } from "./Block";

export interface ParseResult {
    header: string | undefined;
    blocks: Block[];
}

export class ReadmeParser {
    public parse({ content }: { content: string }): ParseResult {
        let header: string | undefined;
        const blocks: Block[] = [];
        const sections = content.split("## ");
        sections.forEach((section, index) => {
            if (index === 0 && !section.startsWith("## ")) {
                // This should only be for the first section (if any).
                header = section;
                return;
            }
            const title = section.split("\n")[0];
            if (title == null) {
                return;
            }
            const id = sectionNameToID(title.replace(/^## /, ""));
            blocks.push(
                new Block({
                    id,
                    content: "## " + section,
                }),
            );
        });
        return {
            header,
            blocks,
        };
    }
}

function sectionNameToID(sectionName: string): string {
    return sectionName.toLowerCase().split(" ").join("");
}
