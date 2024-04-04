import type { Root } from "hast";
import { toString } from "hast-util-to-string";
import { visit } from "unist-util-visit";
import type { VFile } from "vfile";
import { TableOfContentsItem } from "../../custom-docs-page/TableOfContents";
import { valueToEstree } from "./to-estree";
import { toAttribute } from "./utils";

interface FoundHeading {
    depth: number;
    title: string;
    id: string;
}

export function rehypeFernLayout(opts: { test: string }): (tree: Root, vfile: VFile) => void {
    return (tree, vfile) => {
        // const matter = vfile.data.matter as FernDocsFrontmatter;
        const headings: FoundHeading[] = [];

        visit(tree, (node) => {
            if (node.type === "element" && ["h1", "h2", "h3", "h4", "h5", "h6"].includes(node.tagName)) {
                const id = node.properties.id;
                if (id == null || typeof id !== "string") {
                    return;
                }

                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                const depth = parseInt(node.tagName[1]!);
                const title = toString(node);

                headings.push({ depth, id, title });
            }
        });

        const minDepth = Math.min(...headings.map((heading) => heading.depth));
        const tableOfContents = makeTree(headings, minDepth);

        tree.children.unshift({
            type: "mdxJsxFlowElement",
            name: "TableOfContents",
            attributes: [
                toAttribute("tableOfContents", JSON.stringify(tableOfContents), valueToEstree(tableOfContents)),
            ],
            children: [],
        });
    };
}

function makeTree(headings: FoundHeading[], depth: number = 1): TableOfContentsItem[] {
    const tree: TableOfContentsItem[] = [];

    while (headings.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const firstToken = headings[0]!;

        // if the next heading is at a higher level
        if (firstToken.depth < depth) {
            break;
        }

        if (firstToken.depth === depth) {
            const token = headings.shift();
            if (token != null) {
                tree.push({
                    simpleString: token.title.trim(),
                    anchorString: token.id.trim(),
                    children: makeTree(headings, depth + 1),
                });
            }
        } else {
            tree.push(...makeTree(headings, depth + 1));
        }
    }

    return tree;
}
