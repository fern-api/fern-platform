import { snakeCase } from "lodash-es";
import { Writer } from "../utils/Writer";

/**
 * Represents a block of content parsed from an existing README file.
 * Each block is identified by its section name (e.g. from a ## heading)
 * and contains the raw content that follows until the next section.
 * Used to preserve custom sections when regenerating README files.
 */
export class ParsedBlock {
    public sectionName: string;
    public content: string;
    public computedId: string;

    constructor({ sectionName, content }: { sectionName: string; content: string }) {
        this.sectionName = sectionName;
        this.content = content;
        this.computedId = sectionNameToID(sectionName);
    }

    public write(writer: Writer): void {
        writer.write(this.content);
        if (!this.content.endsWith("\n")) {
            writer.writeLine();
        }
    }
}

function sectionNameToID(rawSectionName: string): string {
    return snakeCase(
        rawSectionName
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
