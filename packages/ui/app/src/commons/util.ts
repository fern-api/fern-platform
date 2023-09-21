export function parseCodeBlockLanguageFromClassName(className: string | undefined): string {
    return typeof className === "string" ? className.replace(/language-/, "") : "";
}
