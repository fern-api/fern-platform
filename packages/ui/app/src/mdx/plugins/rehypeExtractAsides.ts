import { extractElementsFromRootContentHast } from "@fern-ui/fern-docs-mdx";
import type { ElementContent, Root } from "hast";
import { visit } from "unist-util-visit";

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
}: Options = {}): (tree: Root) => undefined {
    return (tree) => {
        const asides: ElementContent[] = [];

        visit(tree, "mdxJsxFlowElement", (node, index, parent) => {
            if (node.name !== "Aside" || index == null || parent == null) {
                return;
            }

            // delete the <Aside> tag from the tree
            parent?.children.splice(index, 1);

            // ignore the <Aside> tag itself, and extract all its children
            asides.push(...node.children);

            // don't visit the children of this <Aside> tag
            return "skip";
        });

        // if there are no asides, don't do anything
        if (asides.length === 0) {
            return;
        }

        const { elements, nonelements } = extractElementsFromRootContentHast(tree.children);

        // replace the original tree with a new tree that has the main and aside elements
        tree.children = [
            ...nonelements,
            { type: "mdxJsxFlowElement", name: mainElementName, children: elements, attributes: [] },
            { type: "mdxJsxFlowElement", name: asideElementName, children: asides, attributes: [] },
        ];
    };
}
