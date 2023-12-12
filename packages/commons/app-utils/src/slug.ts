import type { NavigatableDocsNode } from "@fern-api/fdr-sdk";

/**
 * Joins the given URL slugs with a `/`. Ignores empty ones.
 */
export function joinUrlSlugs(...parts: string[]): string {
    return parts
        .map(withoutTrailingSlash)
        .map((part, i) => (i === 0 ? part : withoutLeadingSlash(part)))
        .filter((part) => part.length > 0)
        .join("/");
}

/**
 * The reverse of `joinUrlSlugs()`.
 */
export function splitFullSlugIntoParts(fullSlug: string): string[] {
    return fullSlug.split("/").map(decodeURIComponent);
}

type GetFullSlugForNavigatableOpts = {
    omitDefault?: boolean;
    basePath: string | undefined;
};

export function getFullSlugForNavigatable(node: NavigatableDocsNode, opts: GetFullSlugForNavigatableOpts): string {
    const { omitDefault = false, basePath } = opts ?? {};
    const basePathSlug = basePath != null && basePath.trim().length > 1 ? basePath.trim().slice(1) : undefined;
    const parts: string[] = basePathSlug != null ? [basePathSlug] : [];
    if (node.context.type === "versioned-tabbed" || node.context.type === "versioned-untabbed") {
        if (node.context.version.info.index !== 0 || !omitDefault) {
            parts.push(node.context.version.info.slug);
        }
    }
    parts.push(node.leadingSlug);
    return joinUrlSlugs(...parts);
}

export function getSlugFromUrl({ pathname, basePath }: { pathname: string; basePath: string | undefined }): string {
    const slug = basePath != null ? pathname.replace(new RegExp(`^${basePath}`), "") : pathname;
    return removeLeadingAndTrailingSlashes(slug);
}

function removeLeadingAndTrailingSlashes(s: string): string {
    if (s.startsWith("/")) {
        s = s.substring(1);
    }
    if (s.endsWith("/")) {
        s = s.substring(0, s.length - 1);
    }
    return s;
}

function withoutLeadingSlash(s: string): string {
    return s.startsWith("/") ? s.substring(1) : s;
}

function withoutTrailingSlash(s: string): string {
    return s.endsWith("/") ? s.substring(0, s.length - 1) : s;
}
