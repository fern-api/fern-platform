import grayMatter from "gray-matter";
import { DocsV1Read } from "../../client";
import { FernNavigation } from "../generated";

export function getNoIndexFromFrontmatter(
    pages: Record<string, DocsV1Read.PageContent>,
    pageId: FernNavigation.PageId | undefined,
): boolean | undefined {
    if (pageId == null) {
        return undefined;
    }
    const page = pages[pageId];
    if (page == null) {
        throw new Error(`Page ${pageId} not found`);
    }
    const data = grayMatter(page.markdown).data;
    if (typeof data.noindex === "boolean") {
        return data.noindex;
    }
    return undefined;
}
