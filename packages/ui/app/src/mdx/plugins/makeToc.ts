import { slug } from "github-slugger";
import type { Doctype, ElementContent, Root } from "hast";
import { headingRank } from "hast-util-heading-rank";
import { toString } from "hast-util-to-string";
import { SKIP, visit, type BuildVisitor } from "unist-util-visit";
import type { TableOfContentsItem } from "../../components/table-of-contents/TableOfContentsItem";
import type { AccordionItemProps } from "../components/accordion";
import { getBooleanValue, isElement, isMdxJsxAttribute, isMdxJsxFlowElement } from "./utils";

interface FoundHeading {
    depth: number;
    title: string;
    id: string;
}

type Visitor = BuildVisitor<Root | Doctype | ElementContent>;

export function makeToc(tree: Root, isTocDefaultEnabled = false): TableOfContentsItem[] {
    const headings: FoundHeading[] = [];

    const visitor: Visitor = (node) => {
        // if the node is a <Steps toc={false}>, skip traversing its children
        if (isMdxJsxFlowElement(node) && node.name === "StepGroup") {
            const isTocEnabled =
                getBooleanValue(
                    node.attributes.find((attr) => isMdxJsxAttribute(attr) && attr.name === "toc")?.value,
                ) ?? isTocDefaultEnabled;

            if (isTocEnabled) {
                node.children.forEach((child) => {
                    if (child.type === "mdxJsxFlowElement" && child.name === "Step") {
                        const id = child.attributes.filter(isMdxJsxAttribute).find((attr) => attr.name === "id")?.value;
                        const title = child.attributes
                            .filter(isMdxJsxAttribute)
                            .find((attr) => attr.name === "title")?.value;
                        if (id == null || typeof id !== "string" || title == null || typeof title !== "string") {
                            return;
                        }
                        headings.push({ depth: 3, id, title });

                        visit(child, visitor);
                    }
                });
            }
            return SKIP;
        }

        // parse markdown headings
        const rank = headingRank(node);
        if (isElement(node) && rank != null) {
            const id = node.properties.id;
            if (id == null || typeof id !== "string") {
                return;
            }

            const title = toString(node);

            headings.push({ depth: rank, id, title });
        }

        // parse mdx-jsx headings i.e. `<h1 id="my-id">My Title</h1>`
        if (
            isMdxJsxFlowElement(node) &&
            node.name != null &&
            ["h1", "h2", "h3", "h4", "h5", "h6"].includes(node.name)
        ) {
            const id = node.attributes.find((attr) => attr.type === "mdxJsxAttribute" && attr.name === "id")?.value;
            if (id == null || typeof id !== "string") {
                return;
            }

            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const depth = parseInt(node.name[1]!);
            const title = toString(node);
            headings.push({ depth, id, title });
        }

        if (isMdxJsxFlowElement(node) && node.name === "TabGroup") {
            const attributes = node.attributes.filter(isMdxJsxAttribute);
            const itemsAttr = attributes.find((attr) => attr.name === "tabs");
            const tocAttr = attributes.find((attr) => attr.name === "toc");
            const isParentTocEnabled = getBooleanValue(tocAttr?.value) ?? isTocDefaultEnabled;
            if (itemsAttr?.value == null || typeof itemsAttr.value === "string") {
                return;
            }

            try {
                const items = JSON.parse(itemsAttr.value.value) as AccordionItemProps[];
                items.forEach((item) => {
                    const isTocEnabled = getBooleanValue(item.toc?.value) ?? isParentTocEnabled;
                    if (item.title.trim().length === 0 || !isTocEnabled) {
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
            const attributes = node.attributes.filter(isMdxJsxAttribute);
            const itemsAttr = attributes.find((attr) => attr.name === "items");
            const tocAttr = attributes.find((attr) => attr.name === "toc");
            const isParentTocEnabled = getBooleanValue(tocAttr?.value) ?? isTocDefaultEnabled;

            if (itemsAttr?.value == null || typeof itemsAttr.value === "string") {
                return;
            }

            try {
                const items = JSON.parse(itemsAttr.value.value) as AccordionItemProps[];
                items.forEach((item) => {
                    const isTocEnabled = getBooleanValue(item.toc?.value) ?? isParentTocEnabled;
                    if (item.title.trim().length === 0 || !isTocEnabled) {
                        return;
                    }
                    headings.push({ depth: 6, id: slug(item.title), title: item.title });
                });
            } catch (e) {
                // eslint-disable-next-line no-console
                console.error(e);
            }
        }

        return;
    };

    visit(tree, visitor);

    const minDepth = Math.min(...headings.map((heading) => heading.depth));
    return makeTree(headings, minDepth);

    // const tableOfContents: ElementContent = {
    //     type: "mdxJsxFlowElement",
    //     name: "TableOfContents",
    //     attributes: [toAttribute("tableOfContents", makeTree(headings, minDepth))],
    //     children: [],
    // };
    // return tableOfContents;
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
