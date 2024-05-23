import { Block } from "./Block";

export class ReadmeParser {
    public parse({ content }: { content: string }): Block[] {
        const blocks: Block[] = [];
        for (const section of content.split(/(^## .+)/m)) {
            if (!section.startsWith("## ")) {
                // This should only be for the first section (if any).
                continue;
            }
            const title = section.split("\n")[0];
            if (title == null) {
                continue;
            }
            const id = sectionNameToID(title.replace(/^## /, ""));
            blocks.push(
                new Block({
                    id,
                    content: section,
                }),
            );
        }
        return blocks;
    }
}

function sectionNameToID(sectionName: string): string {
    return sectionName.toLowerCase().split(" ").join("");
}
