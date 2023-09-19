export function parseCodeLanguageFromClassName(className: unknown): string {
    if (typeof className !== "string") {
        return "";
    }
    return className.replace(/language-/, "");
}
