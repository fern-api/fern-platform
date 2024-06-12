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
                if (node.name === "Tabs") {
                    transformTabs(node, index, parent);
                }

                if (node.name === "TabGroup") {
                    transformTabs(node, index, parent);
                }

                if (node.name === "AccordionGroup") {
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

        let example: string | undefined;
        visit(tree, (node) => {
            if (isMdxJsxFlowElement(node)) {
                const isRequestSnippet = node.name === "EndpointRequestSnippet";
                const isResponseSnippet = node.name === "EndpointResponseSnippet";
                if (isRequestSnippet || isResponseSnippet) {
                    const exampleAttr = node.attributes.find((attr) => "name" in attr && attr.name === "example");

                    if (isRequestSnippet) {
                        if (typeof exampleAttr?.value === "string") {
                            example = exampleAttr.value;
                        } else {
                            example = undefined;
                        }
                    } else {
                        if (!exampleAttr && example) {
                            node.attributes.push(toAttribute("example", example));
                        }
                        example = undefined;
                    }
                }
            }
        });

        // convert img to Image
        visit(tree, (node, index) => {
            if (index == null) {
                return;
            }
            if (isMdxJsxFlowElement(node)) {
                if (node.name === "img") {
                    node.name = "Image";
                } else if (node.name === "iframe") {
                    node.name = "IFrame";
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
