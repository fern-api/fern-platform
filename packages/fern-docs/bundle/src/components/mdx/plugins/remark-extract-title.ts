import { FernDocs } from "@fern-api/fdr-sdk";
import { type Mdast, mdastToString } from "@fern-docs/mdx";

interface Options {
  frontmatter: FernDocs.Frontmatter;
}

/**
 * Extracts the title from the first content child of the document.
 *
 * If the title is already set inside the frontmatter, it will not be overwritten.
 *
 * Because fern docs renders the title separately, this plugin also removes the <h1> from the tree.
 *
 * Note: we'll ignore the title if there are any attributes on the <h1> tag. This is to avoid
 * extracting the title from a <h1> that was intentionally inserted.
 */
export function remarkExtractTitle(options?: Options) {
  return (tree: Mdast.Root) => {
    if (options == null) {
      return;
    }

    // don't overwrite existing title set inside the frontmatter
    if (options.frontmatter.title) {
      return;
    }

    const firstChild = tree.children[0];
    if (!firstChild) {
      return;
    }

    if (firstChild.type === "heading" && firstChild.depth === 1) {
      const extractedTitle = mdastToString(firstChild);

      if (!extractedTitle) {
        return;
      }

      // set the title and remove the <h1> from the tree
      options.frontmatter.title = extractedTitle;
      tree.children = tree.children.slice(1);
    }
  };
}
