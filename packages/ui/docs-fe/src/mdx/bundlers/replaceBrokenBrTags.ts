export function replaceBrokenBrTags(content: string): string {
    return content.replaceAll(/<br\s*\/?>/g, "<br />").replaceAll("</br>", "");
}
