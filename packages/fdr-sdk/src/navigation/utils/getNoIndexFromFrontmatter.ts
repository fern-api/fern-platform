/**
 * As as temporary workaround, we'll use a simple regex to extract the frontmatter and check for `noindex: true` or `noindex: false`.
 */
export function getNoIndexFromFrontmatter(
    frontmatter: string
): boolean | undefined {
    if (/noindex:\s*true/.test(frontmatter)) {
        return true;
    } else if (/noindex:\s*false/.test(frontmatter)) {
        return false;
    }
    return undefined;
}
