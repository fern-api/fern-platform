import * as FernDocs from "@fern-api/fdr-sdk/docs";
import grayMatter from "gray-matter";

export function getFrontmatter(content: string): {
  data: FernDocs.Frontmatter;
  content: string;
} {
  try {
    const gm = grayMatter(content.trimStart());
    return {
      data: gm.data as FernDocs.Frontmatter,
      content: gm.content,
    };
  } catch (e) {
    console.error(e);
    return {
      data: {} as FernDocs.Frontmatter,
      content,
    };
  }
}
