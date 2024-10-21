import { HeadingMetadata, collectRootHeadings } from "./headings.js";
import { parseMarkdownToTree } from "./parse.js";

export interface MarkdownSectionRoot {
    type: "root";
    content: string;
}

export interface MarkdownSectionItem {
    type: "section";
    heading: HeadingMetadata;
    parents: HeadingMetadata[];
    content: string;
}

export type MarkdownSection =
    | MarkdownSectionRoot // there can only be one root node, or none, if there is no content
    | MarkdownSectionItem;

/**
 * Each section of markdown is broken up by headings.
 *
 * For example:
 * ```mdx
 * Root content
 *
 * # My Heading
 *
 * Some content
 *
 * ## My Subheading
 *
 * Some more content
 * ```
 *
 * will be split into 3 sections:
 *
 * 1. { type: "root", content: "Root content" }
 * 2. { type: "section", heading: { depth: 1, title: "My Heading", anchor: "my-heading", start: 1, length: 1 }, parents: [], content: "Some content" }
 * 3. { type: "section", heading: { depth: 2, title: "My Subheading", anchor: "my-subheading", start: 2, length: 1 }, parents: [heading], content: "Some more content" }
 *
 *
 * @param content must be markdown without frontmatter
 * @returns list of markdown sections
 */
export function splitMarkdownIntoSections(markdownContent: string): MarkdownSection[] {
    const lines = markdownContent.split("\n");
    const tree = parseMarkdownToTree(markdownContent);

    const headers = [...collectRootHeadings(tree, lines)];

    const stack: HeadingMetadata[] = [];

    const sections: MarkdownSection[] = [];

    // for each heading, extract the text that immediately follows it, but before the next heading
    // and add it to the records. If there is no next heading, use the rest of the document.
    // note: the content immediately before the first heading is also added to the records

    let heading = headers.shift();

    if (heading == null) {
        const content = markdownContent.trim();
        // no headings, so we're done
        return content.length === 0 ? [] : [{ type: "root", content }];
    } else {
        const textBeforeFirstHeading = markdownContent.slice(0, heading.start).trim();
        const content = textBeforeFirstHeading.trim();
        if (content.length > 0) {
            sections.push({
                type: "root",
                content: textBeforeFirstHeading,
            });
        }
    }

    while (heading != null) {
        const nextHeading = headers.shift();

        // if the nextHeading is null, slice to the end of the document
        const textBeforeNextHeading = markdownContent.slice(heading.start + heading.length, nextHeading?.start).trim();

        // append current section
        if (textBeforeNextHeading.length > 0) {
            const content = textBeforeNextHeading.trim();

            // skip empty sections
            if (content.length > 0) {
                sections.push({
                    type: "section",
                    heading,
                    parents: [...stack],
                    content,
                });
            }
        }

        // update the breadcrumb stack
        if (nextHeading != null) {
            // if the next heading is deeper than the current heading, push the current heading onto the stack
            if (nextHeading.depth > heading.depth) {
                stack.push(heading);
            } else {
                // pop until we find the correct depth
                while (stack.length > 0 && (stack[stack.length - 1]?.depth ?? 0) >= nextHeading.depth) {
                    stack.pop();
                }
            }
        }

        heading = nextHeading;
    }

    return sections;
}
