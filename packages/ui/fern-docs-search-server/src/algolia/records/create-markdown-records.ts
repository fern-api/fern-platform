import { isNonNullish } from "@fern-api/ui-core-utils";
import {
    MarkdownSectionRoot,
    getFrontmatter,
    markdownToString,
    splitMarkdownIntoSections,
} from "@fern-ui/fern-docs-mdx";
import { compact, flatten } from "es-toolkit";
import { BaseRecord, MarkdownRecord } from "../types.js";
import { maybePrepareMdxContent } from "./prepare-mdx-content.js";

interface CreateMarkdownRecordsOptions {
    base: BaseRecord;
    markdown: string;
}

// TODO: the `<If>` component is not supported, and will show up in search results!
export function createMarkdownRecords({ base, markdown }: CreateMarkdownRecordsOptions): MarkdownRecord[] {
    const { data, content } = getFrontmatter(markdown);

    /**
     * If the title is not set in the frontmatter, use the title from the sidebar.
     */
    // TODO: handle case where title is set in <h1> tag (this should be an upstream utility)
    const page_title = markdownToString(data.title) ?? base.page_title;

    const sections = [...splitMarkdownIntoSections(content)];

    // meta descriptions will be pre-pended to the root node, so we need to collect them here:
    const metaDescriptions = [data.description, data.subtitle ?? data.excerpt, data["og:description"]];

    // the root content can be missing if there is a subheading that immediately after the top of the page.
    let rootContent: string | undefined;
    if (sections[0]?.type === "root") {
        const rootSection = sections.shift() as MarkdownSectionRoot;
        rootContent = rootSection.content;
    }

    // collect all meta descriptions along with the root content, all of which can be used for string matching
    const description = [...metaDescriptions]
        .filter(isNonNullish)
        .map((text) => text.trim())
        .filter((text) => text.length > 0)
        .join("\n\n");

    const records: MarkdownRecord[] = [];

    // we should still insert this record even if there's no content, because
    // the title of the record can still be matched
    const { content: description_content, code_snippets: description_code_snippets } =
        maybePrepareMdxContent(description);
    const { content: root_content, code_snippets: root_code_snippets } = maybePrepareMdxContent(rootContent);
    const code_snippets = flatten(compact([base.code_snippets, description_code_snippets, root_code_snippets]));
    records.push({
        ...base,
        type: "markdown",
        hash: undefined,
        description: description_content,
        content: root_content,
        code_snippets,
        page_title,
    });

    sections.forEach((section, i) => {
        if (section.type === "root") {
            // the root section should have been shifted off this array earlier
            throw new Error(`Invariant: unexpected root section detected at index=${i + 1}`);
        }

        const { heading, content: markdownContent, parents } = section;

        const hierarchy: Record<`h${1 | 2 | 3 | 4 | 5 | 6}`, { id: string; title: string } | undefined> = {
            h1: parents[0]?.depth === 1 ? { id: heading.id, title: heading.title } : undefined,
            h2: parents[0]?.depth === 2 ? { id: heading.id, title: heading.title } : undefined,
            h3: parents[0]?.depth === 3 ? { id: heading.id, title: heading.title } : undefined,
            h4: parents[0]?.depth === 4 ? { id: heading.id, title: heading.title } : undefined,
            h5: parents[0]?.depth === 5 ? { id: heading.id, title: heading.title } : undefined,
            h6: parents[0]?.depth === 6 ? { id: heading.id, title: heading.title } : undefined,
        };

        hierarchy[`h${heading.depth}`] = { id: heading.id, title: heading.title };

        const prepared = maybePrepareMdxContent(markdownContent);
        const code_snippets = flatten(compact([base.code_snippets, prepared.code_snippets]));

        // Note: unlike the root content, it's less important if subheadings are not indexed if there's no content inside
        // which should already been filtered out by splitMarkdownIntoSections()
        // TODO: we should probably separate this out into another record-type specifically for subheadings.
        const record: MarkdownRecord = {
            ...base,
            objectID: `${base.objectID}-${heading.id}`, // theoretically this is unique, but we'll see
            type: "markdown",
            hash: `#${heading.id}`,
            content: prepared.content,
            code_snippets: code_snippets.length > 0 ? code_snippets : undefined,
            hierarchy,
            level: `h${heading.depth}`,
            level_title: markdownToString(heading.title),
        };

        records.push(record);
    });

    return records;
}
