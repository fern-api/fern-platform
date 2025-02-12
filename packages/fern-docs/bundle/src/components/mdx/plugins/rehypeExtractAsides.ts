import {
  type Hast,
  SKIP,
  extractElementsFromRootContentHast,
  visit,
} from "@fern-docs/mdx";

interface Options {
  mainElementName?: string;
  asideElementName?: string;
}

/**
 * Extracts all the children of an <Aside> tag and replaces it with a new <Main> and <Aside> tag
 */
export function rehypeExtractAsides({
  mainElementName = "ReferenceLayoutMain",
  asideElementName = "ReferenceLayoutAside",
}: Options = {}): (tree: Hast.Root) => undefined {
  return (tree) => {
    const asides: Hast.ElementContent[] = [];

    visit(tree, "mdxJsxFlowElement", (node, index, parent) => {
      if (node.name !== "Aside" || index == null || parent == null) {
        return;
      }

      // delete the <Aside> tag from the tree
      parent?.children.splice(index, 1);

      // ignore the <Aside> tag itself, and extract all its children
      asides.push(...node.children);

      // don't visit the children of this <Aside> tag
      return [SKIP, index];
    });

    // if there are no asides, don't do anything
    if (asides.length === 0) {
      return;
    }

    const { elements, nonelements } = extractElementsFromRootContentHast(
      tree.children
    );

    // replace the original tree with a new tree that has the main and aside elements
    tree.children = [
      ...nonelements,
      {
        type: "mdxJsxFlowElement",
        name: mainElementName,
        children: elements,
        attributes: [],
      },
      {
        type: "mdxJsxFlowElement",
        name: asideElementName,
        children: asides,
        attributes: [],
      },
    ];
  };
}
