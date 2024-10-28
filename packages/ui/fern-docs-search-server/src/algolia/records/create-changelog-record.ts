import { BaseRecord, ChangelogRecord } from "../types.js";

interface CreateChangelogRecordOptions {
    base: BaseRecord;
    markdown: string;
    date: string;
}

export function createChangelogRecord({ base, markdown, date }: CreateChangelogRecordOptions): ChangelogRecord {
    return {
        ...base,
        type: "changelog",
        content: markdown,
        date,
    };
}
