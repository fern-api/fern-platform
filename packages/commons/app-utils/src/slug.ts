import type { NavigatableDocsNode } from "@fern-api/fdr-sdk";

/**
 * Joins the given URL slugs with a `/`. Ignores empty ones.
 */
export function joinUrlSlugs(...parts: string[]): string {
    return parts.filter((part) => part.length > 0).join("/");
}

/**
 * The reverse of `joinUrlSlugs()`.
 */
export function splitFullSlugIntoParts(fullSlug: string): string[] {
    return fullSlug.split("/").map(decodeURIComponent);
}

type GetFullSlugForNavigatableOpts = {
    omitDefault?: boolean;
};

export function getFullSlugForNavigatable(node: NavigatableDocsNode, opts?: GetFullSlugForNavigatableOpts): string {
    const { omitDefault = false } = opts ?? {};
    const parts: string[] = [];
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
