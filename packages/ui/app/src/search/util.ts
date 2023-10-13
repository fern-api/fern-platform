import type { SearchRecord } from "./types";

export function getFullPathForSearchRecord(record: SearchRecord): string {
    const leadingPath = getLeadingPathForSearchRecord(record);
    if (record.type === "endpoint" || record.type === "page") {
        if (record.versionSlug == null) {
            return `${leadingPath}`;
        } else {
            return `${record.versionSlug}/${leadingPath}`;
        }
    } else {
        if (record.version == null) {
            return `${leadingPath}`;
        } else {
            return `${record.version.urlSlug}/${leadingPath}`;
        }
    }
}

function getLeadingPathForSearchRecord(record: SearchRecord): string {
    switch (record.type) {
        case "page":
        case "endpoint":
            return record.path;
        case "page-v2":
        case "endpoint-v2":
            return record.path.parts
                .filter((p) => p.skipUrlSlug !== true)
                .map((p) => p.urlSlug)
                .join("/");
    }
}
