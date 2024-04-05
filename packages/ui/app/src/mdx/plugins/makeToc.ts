import { slug } from "github-slugger";
import type { ElementContent, Root } from "hast";
import { headingRank } from "hast-util-heading-rank";
import { toString } from "hast-util-to-string";
import { visit } from "unist-util-visit";
import { TableOfContentsItem } from "../../custom-docs-page/TableOfContents";
import { AccordionItemProps } from "../components/AccordionGroup";
import { isElement, isMdxJsxAttribute, isMdxJsxFlowElement, toAttribute } from "./utils";

interface FoundHeading {
    depth: number;
    title: string;
    id: string;
}

export function makeToc(tree: Root): ElementContent {
    const headings: FoundHeading[] = [];

    visit(tree, (node) => {
        const rank = headingRank(node);
        if (isElement(node) && rank != null) {
            const id = node.properties.id;
            if (id == null || typeof id !== "string") {
                return;
            }

            const title = toString(node);

            headings.push({ depth: rank, id, title });
        }

        if (
            isMdxJsxFlowElement(node) &&
            node.name != null &&
            ["h1", "h2", "h3", "h4", "h5", "h6"].includes(node.name)
        ) {
            const id = node.attributes.find((attr) => attr.type === "mdxJsxAttribute" && attr.name === "is")?.value;
            if (id == null || typeof id !== "string") {
                return;
            }

            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const depth = parseInt(node.name[1]!);
            const title = toString(node);
            headings.push({ depth, id, title });
        }

        if (isMdxJsxFlowElement(node) && node.name === "TabGroup") {
            // node.attributes.find(attr => attr.type === "mdxJsxAttribute" && attr.name === "toc")?.data;
            const attributes = node.attributes.filter(isMdxJsxAttribute);
            const itemsAttr = attributes.find((attr) => attr.name === "tabs");
            if (itemsAttr?.value == null || typeof itemsAttr.value === "string") {
                return;
            }

            try {
                const items = JSON.parse(itemsAttr.value.value) as AccordionItemProps[];
                items.forEach((item) => {
                    if (item.title.trim().length === 0 || item.toc === false) {
                        return;
                    }
                    headings.push({ depth: 6, id: slug(item.title), title: item.title });
                });
            } catch (e) {
                // eslint-disable-next-line no-console
                console.error(e);
            }
        }

        if (isMdxJsxFlowElement(node) && node.name === "AccordionGroup") {
            // node.attributes.find(attr => attr.type === "mdxJsxAttribute" && attr.name === "toc")?.data;
            // console.log(node);
            const attributes = node.attributes.filter(isMdxJsxAttribute);
            const itemsAttr = attributes.find((attr) => attr.name === "items");
            // const tocAttr = attributes.find((attr) => attr.name === "toc");

            // const parentSkipToc = tocAttr != null && typeof tocAttr.value === "object" && tocAttr.value?.value === "false";

            if (itemsAttr?.value == null || typeof itemsAttr.value === "string") {
                return;
            }

            try {
                const items = JSON.parse(itemsAttr.value.value) as AccordionItemProps[];
                items.forEach((item) => {
                    if (item.title.trim().length === 0 || item.toc === false) {
                        return;
                    }
                    headings.push({ depth: 6, id: slug(item.title), title: item.title });
                });
            } catch (e) {
                // eslint-disable-next-line no-console
                console.error(e);
            }
        }
    });

    const minDepth = Math.min(...headings.map((heading) => heading.depth));

    const tableOfContents: ElementContent = {
        type: "mdxJsxFlowElement",
        name: "TableOfContents",
        attributes: [toAttribute("tableOfContents", makeTree(headings, minDepth))],
        children: [],
    };
    return tableOfContents;
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
