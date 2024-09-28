export function replaceMarksInUrls(markdown: string): string {
    // Regular expression to match Markdown links: [link text](url)
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;

    return markdown.replace(linkRegex, (match, linkText, url) => {
        const cleanedUrl = url.replace(/<\/?mark>/g, "");
        return `[${linkText}](${cleanedUrl})`;
    });
}
