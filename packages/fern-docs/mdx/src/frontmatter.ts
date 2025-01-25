import * as FernDocs from "@fern-api/fdr-sdk/docs";
import grayMatter from "gray-matter";
import { toTree } from "./parse";

export function getFrontmatter(content: string): {
  data: FernDocs.Frontmatter;
  content: string;
} {
  try {
    const gm = grayMatter(content.trimStart());
    const frontmatter = { ...gm.data } as FernDocs.Frontmatter;
    toTree(gm.content, { frontmatter });
    return {
      data: frontmatter,
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
