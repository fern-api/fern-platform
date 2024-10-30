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
        code_snippets: code_snippets.length > 0 ? code_snippets : undefined,
        page_title,
    });

    sections.forEach((section, i) => {
        if (section.type === "root") {
            // the root section should have been shifted off this array earlier
            throw new Error(`Invariant: unexpected root section detected at index=${i + 1}`);
        }

        const { heading, content: markdownContent, parents } = section;

        const h1 = parents.find((p) => p.depth === 1);
        const h2 = parents.find((p) => p.depth === 2);
        const h3 = parents.find((p) => p.depth === 3);
        const h4 = parents.find((p) => p.depth === 4);
        const h5 = parents.find((p) => p.depth === 5);
        const h6 = parents.find((p) => p.depth === 6);

        const hierarchy: Record<`h${1 | 2 | 3 | 4 | 5 | 6}`, { id: string; title: string } | undefined> = {
            h1: h1 ? { id: h1.id, title: h1.title } : undefined,
            h2: h2 ? { id: h2.id, title: h2.title } : undefined,
            h3: h3 ? { id: h3.id, title: h3.title } : undefined,
            h4: h4 ? { id: h4.id, title: h4.title } : undefined,
            h5: h5 ? { id: h5.id, title: h5.title } : undefined,
            h6: h6 ? { id: h6.id, title: h6.title } : undefined,
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
