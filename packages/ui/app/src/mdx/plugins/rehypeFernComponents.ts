import type { Element, ElementContent, Root } from "hast";
import { MdxJsxAttributeValueExpression, MdxJsxFlowElementHast } from "mdast-util-mdx-jsx";
import { visit } from "unist-util-visit";
import { wrapChildren } from "./to-estree";
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

                if (node.name === "TabGroup" && node.children.length > 0) {
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
        .map(collectProps);

    // const toc = getBooleanValue(node.attributes.find(
    //     (attr) => attr.type === "mdxJsxAttribute" && attr.name === "toc",
    // )?.value);

    parent.children.splice(index, 1, {
        type: "mdxJsxFlowElement",
        name: "TabGroup",
        attributes: [toAttribute("tabs", tabs), ...node.attributes],
        children: [],
    });
}

// function getBooleanValue(value: string | MdxJsxAttributeValueExpression | null | undefined): boolean | undefined {
//     if (value == null) {
//         return undefined;
//     }

//     if (typeof value === "string") {
//         return value === "true" ? true : value === "false" ? false : undefined;
//     }

//     if (value.type === "mdxJsxAttributeValueExpression") {
//         return value.value === "true" ? true : value.value === "false" ? false : undefined;
//     }

//     return undefined;
// }

function transformTabItem(
    node: MdxJsxFlowElementHast,
    index: number,
    parent: Root | Element | MdxJsxFlowElementHast,
): void {
    const tabItem = collectProps(node);
    const tabs = [tabItem];

    parent.children.splice(index, 1, {
        type: "mdxJsxFlowElement",
        name: "TabGroup",
        attributes: [toAttribute("tabs", tabs), ...node.attributes],
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
        .map(collectProps);

    parent.children.splice(index, 1, {
        type: "mdxJsxFlowElement",
        name: "AccordionGroup",
        attributes: [toAttribute("items", items), ...node.attributes],
        children: [],
    });
}

function transformAccordion(
    node: MdxJsxFlowElementHast,
    index: number,
    parent: Root | Element | MdxJsxFlowElementHast,
): void {
    const item = collectProps(node);
    const items = [item];

    parent.children.splice(index, 1, {
        type: "mdxJsxFlowElement",
        name: "AccordionGroup",
        attributes: [toAttribute("items", items)],
        children: [],
    });
}

function collectProps(child: MdxJsxFlowElementHast) {
    const props: Record<string, ElementContent | string | MdxJsxAttributeValueExpression | null | undefined> = {};

    child.attributes.forEach((attr) => {
        if (attr.type === "mdxJsxAttribute") {
            props[attr.name] = attr.value;
        }

        // expression attributes are not supported
    });

    if (child.children.length > 0) {
        props.children = wrapChildren(child.children);
    }

    return props;
}
