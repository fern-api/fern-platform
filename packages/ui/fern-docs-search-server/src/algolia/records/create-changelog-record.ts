import { chunkToBytes, formatUtc, measureBytes } from "@fern-api/ui-core-utils";
import { getFrontmatter, markdownToString } from "@fern-ui/fern-docs-mdx";
import { compact, flatten } from "es-toolkit/array";
import { decode } from "html-entities";
import { maybePrepareMdxContent } from "../../utils/prepare-mdx-content";
import { BaseRecord, ChangelogRecord } from "../types";

interface CreateChangelogRecordOptions {
    base: BaseRecord;
    markdown: string;
    date: string;
}

export function createChangelogRecord({ base, markdown, date }: CreateChangelogRecordOptions): ChangelogRecord[] {
    const { data, content } = getFrontmatter(markdown);

    /**
     * If the title is not set in the frontmatter, use the title from the sidebar.
     */
    // TODO: handle case where title is set in <h1> tag (this should be an upstream utility)
    const data_title = markdownToString(data.title);
    const title = data_title != null ? decode(data_title) : base.title;

    const prepared = maybePrepareMdxContent(content);
    const code_snippets = flatten(compact([base.code_snippets, prepared.code_snippets])).filter(
        (codeSnippet) => measureBytes(codeSnippet.code) < 2000,
    );

    const changelogBase: ChangelogRecord = {
        ...base,
        type: "changelog",
        title,
        date: formatUtc(new Date(date), "yyyy-MM-dd"),
        date_timestamp: Math.floor(new Date(date).getTime() / 1000),
    };

    const chunks = chunkToBytes(prepared.content ?? "", 50 * 1000);

    if (chunks.length === 0) {
        return [{ ...changelogBase, code_snippets: code_snippets.length > 0 ? code_snippets : undefined }];
    }

    return chunks.map((chunk, i) => ({
        ...changelogBase,
        content: chunk,
        code_snippets: i === 0 && code_snippets.length > 0 ? code_snippets : undefined,
    }));
}
