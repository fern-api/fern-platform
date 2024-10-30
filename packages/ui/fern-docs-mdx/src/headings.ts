import GithubSlugger from "github-slugger";
import type { Root } from "mdast";
import { visit } from "unist-util-visit";
import { extractAnchorFromHeadingText } from "./handlers/custom-headings.js";
import { mdastToString } from "./mdast-utils/mdast-to-string.js";
import { getPosition } from "./position.js";

export interface HeadingMetadata {
    depth: 1 | 2 | 3 | 4 | 5 | 6;
    title: string;
    id: string;

    /**
     * Position of the heading in the raw markdown
     */
    start: number;
    length: number;
}

const slugger = new GithubSlugger();

/**
 *
 * @param tree markdown tree
 * @param lines lines of the raw markdown (split by "\n") used to calculate the position of the heading
 * @returns
 */
export function collectRootHeadings(tree: Root, lines: readonly string[]): HeadingMetadata[] {
    slugger.reset();

    const headings: HeadingMetadata[] = [];

    visit(tree, "heading", (heading, _index, parent) => {
        if (parent?.type !== "root") {
            return;
        }

        if (!heading.position) {
            // eslint-disable-next-line no-console
            console.error("Expected heading to have position; Skipping...");
            return;
        }

        // `toString` will strip away all markdown formatting for the title
        // TODO: we should preserve some formatting within the heading, i.e. `<code>` and `<u>`, etc.
        const rawTitle = mdastToString(heading, { preserveNewlines: false });

        const extractedTitle = extractAnchorFromHeadingText(rawTitle);
        const title = extractedTitle.text;

        let id = extractedTitle.anchor;

        if (id == null) {
            id = slugger.slug(title);
        } else {
            // add occurrences to ensure uniqueness
            slugger.occurrences[id] = (slugger.occurrences[id] ?? 0) + 1;
        }

        const { start, length } = getPosition(lines, heading.position);
        headings.push({ depth: heading.depth, title, id, start, length });
    });

    return headings;
}
