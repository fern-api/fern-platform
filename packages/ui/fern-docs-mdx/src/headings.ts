import GithubSlugger from "github-slugger";
import type { Root } from "mdast";
import { toString } from "mdast-util-to-string";
import { visit } from "unist-util-visit";
import { extractAnchorFromHeadingText } from "./handlers/custom-headings.js";
import { getPosition } from "./position.js";

export interface HeadingMetadata {
    depth: 1 | 2 | 3 | 4 | 5 | 6;
    title: string;
    anchor: string;

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
        const title = toString(heading);

        let anchor = extractAnchorFromHeadingText(title).anchor;

        if (anchor == null) {
            anchor = slugger.slug(title);
        } else {
            // add occurrences to ensure uniqueness
            slugger.occurrences[anchor] = (slugger.occurrences[anchor] ?? 0) + 1;
        }

        const { start, length } = getPosition(lines, heading.position);
        headings.push({ depth: heading.depth, title, anchor, start, length });
    });

    return headings;
}
