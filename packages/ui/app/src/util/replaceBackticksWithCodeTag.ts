export function replaceBackticksWithCodeTags(line: string): string {
    return line.replace(/`([^`]+)`/g, (_, content) => {
        const escapedContent = content
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/&lt;mark&gt;/g, "<mark>")
            .replace(/&lt;\/mark&gt;/g, "</mark>");

        return `<code>${escapedContent}</code>`;
    });
}
