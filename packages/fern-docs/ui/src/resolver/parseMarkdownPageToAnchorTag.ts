import GithubSlugger from "github-slugger";

export function parseMarkdownPageToAnchorTag(
    markdown: string
): string | undefined {
    /**
     * new slugger instance per page to avoid conflicts between pages
     */
    const slugger = new GithubSlugger();

    // TODO: This regex match is temporary and will be replaced with a more robust solution
    const matches = markdown.match(/^(#{1,6})\s+(.+)$/gm);
    let anchorTag = undefined;
    if (matches) {
        const originalSlug = slugger.slug(matches[0]);
        anchorTag = originalSlug.match(/[^$$]+/)?.[0].slice(1);
    }

    return anchorTag;
}
