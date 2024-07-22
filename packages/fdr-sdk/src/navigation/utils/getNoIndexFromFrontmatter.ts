/**
 * The use of gray-matter package is not allowed in edge-side code, because it uses `eval` internally.
 * https://github.com/jonschlinkert/gray-matter/blob/ce67a86dba419381db0dd01cc84e2d30a1d1e6a5/lib/engines.js#L43
 *
 * As as temporary workaround, we'll use a simple regex to extract the frontmatter and check for `noindex: true` or `noindex: false`.
 */
export function getNoIndexFromFrontmatter(markdown: string): boolean | undefined {
    const frontmatterMatch = /^---\s*([\s\S]*?)\s*---/.exec(markdown.trimStart());
    if (!frontmatterMatch) {
        return undefined;
    }

    const frontmatter = frontmatterMatch[1];
    if (/noindex:\s*true/.test(frontmatter)) {
        return true;
    } else if (/noindex:\s*false/.test(frontmatter)) {
        return false;
    }
    return undefined;
}
