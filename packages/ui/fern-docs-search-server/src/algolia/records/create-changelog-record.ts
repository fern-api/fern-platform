import { compact, flatten } from "es-toolkit";
import { BaseRecord, ChangelogRecord } from "../types.js";
import { maybePrepareMdxContent } from "./prepare-mdx-content.js";

interface CreateChangelogRecordOptions {
    base: BaseRecord;
    markdown: string;
    date: string;
}

export function createChangelogRecord({ base, markdown, date }: CreateChangelogRecordOptions): ChangelogRecord {
    const prepared = maybePrepareMdxContent(markdown);
    const code_snippets = flatten(compact([base.code_snippets, prepared.code_snippets]));
    return {
        ...base,
        type: "changelog",
        content: prepared.content,
        code_snippets: code_snippets.length > 0 ? code_snippets : undefined,
        date,
    };
}
