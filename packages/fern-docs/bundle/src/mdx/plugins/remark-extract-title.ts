import { parse as parseYaml, stringify as stringifyYaml } from "yaml";

import { type Mdast, Unified, mdastToString } from "@fern-docs/mdx";

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
export const remarkExtractTitle: Unified.Plugin<[], Mdast.Root> = () => {
  return (tree: Mdast.Root) => {
    const firstHeadingIndex = tree.children.findIndex(
      (child) => child.type !== "mdxjsEsm" && child.type !== "yaml"
    );
    if (firstHeadingIndex === -1) {
      return;
    }

    const firstHeading = tree.children[firstHeadingIndex];
    if (firstHeading?.type === "heading" && firstHeading.depth === 1) {
      const extractedTitle = mdastToString(firstHeading);

      if (!extractedTitle) {
        return;
      }
      tree.children.splice(firstHeadingIndex, 1);

      const yaml = tree.children.find((child) => child.type === "yaml");
      if (yaml == null) {
        tree.children.unshift({
          type: "yaml",
          value: `title: ${extractedTitle}`,
        });
      } else {
        const parsedYaml = parseYaml(yaml.value);
        parsedYaml.title = extractedTitle;
        yaml.value = stringifyYaml(parsedYaml);
      }
    }
  };
};
