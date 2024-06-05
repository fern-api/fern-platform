import { joinUrlSlugs } from "@fern-ui/fdr-utils";
import type { SearchRecord } from "./types.js";

export function getFullPathForSearchRecord(record: SearchRecord, basePath: string | undefined): string {
    const parts =
        basePath
            ?.split("/")
            .map((part) => part.trim())
            .filter((part) => part.length > 0) ?? [];
    const leadingPath = getLeadingPathForSearchRecord(record);
    if (record.type === "endpoint" || record.type === "page") {
        if (record.versionSlug == null) {
            parts.push(...leadingPath);
        } else {
            parts.push(record.versionSlug, ...leadingPath);
        }
    } else {
        if (record.version == null) {
            parts.push(...leadingPath);
        } else {
            // return `${record.version.urlSlug}/${leadingPath}`;
            parts.push(record.version.urlSlug, ...leadingPath);
        }
    }
    return joinUrlSlugs(...parts);
}

function getLeadingPathForSearchRecord(record: SearchRecord): string[] {
    switch (record.type) {
        case "page":
        case "endpoint":
            return [record.path];
        case "page-v2":
        case "endpoint-v2":
            return record.path.parts.filter((p) => p.skipUrlSlug !== true).map((p) => p.urlSlug);
    }
}
