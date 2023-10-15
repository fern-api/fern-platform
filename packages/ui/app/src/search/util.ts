import type { SearchRecord } from "./types";

export function getPathForSearchRecord(record: SearchRecord): string {
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

export function getHrefForSearchRecord(record: SearchRecord): string {
    const path = getPathForSearchRecord(record);
    if (record.type === "endpoint" || record.type === "page") {
        if (record.versionSlug == null) {
            return `/${path}`;
        } else {
            return `/${record.versionSlug}/${path}`;
        }
    } else {
        if (record.version == null) {
            return `/${path}`;
        } else {
            return `/${record.version.urlSlug}/${path}`;
        }
    }
}
