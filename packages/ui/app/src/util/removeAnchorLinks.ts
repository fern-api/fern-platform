export function removeAnchorLinks(title: string): string {
    return title.replace(/\s*\[\s*#[^\]]*\s*\]/g, "").trim();
}
