/**
 * The use of gray-matter package is not allowed in edge-side code, because it uses `eval` internally.
 * https://github.com/jonschlinkert/gray-matter/blob/ce67a86dba419381db0dd01cc84e2d30a1d1e6a5/lib/engines.js#L43
 */
export function getFrontmatter(markdown: string): string | undefined {
    const frontmatterMatch = /^---\s*([\s\S]*?)\s*---/.exec(markdown.trimStart());
    if (!frontmatterMatch || frontmatterMatch[1] == null) {
        return undefined;
    }
    return frontmatterMatch[1];
}
