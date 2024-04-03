import type { Element, Root } from "hast";
import { MdxJsxFlowElementHast } from "mdast-util-mdx-jsx";
import { visit } from "unist-util-visit";
import { valueToEstree, wrapChildren } from "./to-estree";
import { isMdxJsxFlowElement, toAttribute } from "./utils";

export function rehypeFernComponents(): (tree: Root) => void {
    return function (tree: Root): void {
        visit(tree, (node, index, parent) => {
            if (index == null || parent == null || parent.type === "mdxJsxTextElement") {
                return;
            }

            if (isMdxJsxFlowElement(node) && node.name != null) {
                if (node.name === "Tabs" && node.children.length > 0) {
                    transformTabs(node, index, parent);
                }

                if (node.name === "AccordionGroup" && node.children.length > 0) {
                    transformAccordionGroup(node, index, parent);
                }
            }
        });

        visit(tree, (node, index, parent) => {
            if (index == null || parent == null || parent.type === "mdxJsxTextElement") {
                return;
            }

            if (isMdxJsxFlowElement(node) && node.name != null) {
                if (node.name === "Tab") {
                    transformTabItem(node, index, parent);
                }

                if (node.name === "Accordion") {
                    transformAccordion(node, index, parent);
                }
            }
        });
    };
}

function transformTabs(
    node: MdxJsxFlowElementHast,
    index: number,
    parent: Root | Element | MdxJsxFlowElementHast,
): void {
    const tabs = node.children
        .filter(isMdxJsxFlowElement)
        .filter((child) => child.name === "Tab")
        .map(createTabOrAccordionItem);

    parent.children.splice(index, 1, {
        type: "mdxJsxFlowElement",
        name: "Tabs",
        attributes: [toAttribute("tabs", JSON.stringify(tabs), valueToEstree(tabs))],
        children: [],
    });
}

function transformTabItem(
    node: MdxJsxFlowElementHast,
    index: number,
    parent: Root | Element | MdxJsxFlowElementHast,
): void {
    const tabItem = createTabOrAccordionItem(node);
    const tabs = [tabItem];

    parent.children.splice(index, 1, {
        type: "mdxJsxFlowElement",
        name: "Tabs",
        attributes: [toAttribute("tabs", JSON.stringify(tabs), valueToEstree(tabs))],
        children: [],
    });
}

function transformAccordionGroup(
    node: MdxJsxFlowElementHast,
    index: number,
    parent: Root | Element | MdxJsxFlowElementHast,
): void {
    const items = node.children
        .filter(isMdxJsxFlowElement)
        .filter((child) => child.name === "Accordion")
        .map(createTabOrAccordionItem);

    parent.children.splice(index, 1, {
        type: "mdxJsxFlowElement",
        name: "AccordionGroup",
        attributes: [toAttribute("items", JSON.stringify(items), valueToEstree(items))],
        children: [],
    });
}

function transformAccordion(
    node: MdxJsxFlowElementHast,
    index: number,
    parent: Root | Element | MdxJsxFlowElementHast,
): void {
    const item = createTabOrAccordionItem(node);
    const items = [item];

    parent.children.splice(index, 1, {
        type: "mdxJsxFlowElement",
        name: "AccordionGroup",
        attributes: [toAttribute("items", JSON.stringify(items), valueToEstree(items))],
        children: [],
    });
}

function createTabOrAccordionItem(child: MdxJsxFlowElementHast) {
    const title = child.attributes.find((attr) => attr.type === "mdxJsxAttribute" && attr.name === "title")?.value;
    return {
        title,
        children: wrapChildren(child.children),
    };
}
