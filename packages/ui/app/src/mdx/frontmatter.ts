import * as FernDocs from "@fern-api/fdr-sdk/docs";
import grayMatter from "gray-matter";

export type FernDocsFrontmatter = FernDocs.Frontmatter;

export function getFrontmatter(content: string): {
    data: FernDocsFrontmatter;
    content: string;
} {
    try {
        const gm = grayMatter(content.trimStart());
        return {
            data: gm.data satisfies Partial<FernDocs.Frontmatter> as FernDocs.Frontmatter,
            content: gm.content,
        };
    } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
        return {
            data: {} as FernDocs.Frontmatter,
            content,
        };
    }
}
