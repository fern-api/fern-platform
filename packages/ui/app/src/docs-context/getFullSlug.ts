import { type DocsInfo, type GetFullSlugOpts } from "./DocsContext";

export function getFullSlug(
    slug: string,
    versionSlug: string,
    activeTabSlug: string | undefined,
    docsType: DocsInfo["type"],
    isOnDefaultVersion: boolean,
    opts?: GetFullSlugOpts
): string {
    const { omitVersionSlug = false, omitTabSlug = false } = opts ?? {};
    const parts: string[] = [];
    if (!omitVersionSlug && docsType === "versioned" && !isOnDefaultVersion && versionSlug) {
        parts.push(`${versionSlug}/`);
    }
    if (!omitTabSlug && activeTabSlug != null) {
        parts.push(`${opts?.tabSlug ?? activeTabSlug}/`);
    }
    parts.push(slug);
    return parts.join("");
}
