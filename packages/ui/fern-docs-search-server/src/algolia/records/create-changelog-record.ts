import { getFrontmatter, markdownToString } from "@fern-ui/fern-docs-mdx";
import { format } from "date-fns";
import { compact, flatten } from "es-toolkit";
import { decode } from "html-entities";
import { BaseRecord, ChangelogRecord } from "../types";
import { maybePrepareMdxContent } from "./prepare-mdx-content";

interface CreateChangelogRecordOptions {
    base: BaseRecord;
    markdown: string;
    date: string;
}

export function createChangelogRecord({ base, markdown, date }: CreateChangelogRecordOptions): ChangelogRecord {
    const { data, content } = getFrontmatter(markdown);

    /**
     * If the title is not set in the frontmatter, use the title from the sidebar.
     */
    // TODO: handle case where title is set in <h1> tag (this should be an upstream utility)
    const data_title = markdownToString(data.title);
    const page_title = data_title != null ? decode(data_title) : base.page_title;

    const prepared = maybePrepareMdxContent(content);
    const code_snippets = flatten(compact([base.code_snippets, prepared.code_snippets]));
    return {
        ...base,
        type: "changelog",
        page_title,
        content: prepared.content,
        code_snippets: code_snippets.length > 0 ? code_snippets : undefined,
        date: format(new Date(date), "yyyy-MM-dd"),
        date_timestamp: Math.floor(new Date(date).getTime() / 1000),
    };
}
