import grayMatter from "gray-matter";

export function getNoIndexFromFrontmatter(markdown: string): boolean | undefined {
    const data = grayMatter(markdown).data;
    if (typeof data.noindex === "boolean") {
        return data.noindex;
    }
    return undefined;
}
