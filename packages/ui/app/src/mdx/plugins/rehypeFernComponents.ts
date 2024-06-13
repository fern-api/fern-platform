import type { Element, ElementContent, Root } from "hast";
import { MdxJsxAttributeValueExpression, MdxJsxFlowElementHast } from "mdast-util-mdx-jsx";
import { CONTINUE, visit } from "unist-util-visit";
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

        /**
         * The code below copies the `example` prop of an
         * `EndpointRequestSnippet` to the next `EndpointResponseSnippet` in the
         * tree. For this behavior to take effect, the following conditions
         * must be met:
         *
         * - The `EndpointResponseSnippet` must not have an `example` prop.
         * - The `EndpointResponseSnippet` must have the same `path` and
         * `method` props as the `EndpointRequestSnippet`.
         */

        let request: { path: string; method: string; example: string } | undefined;

        visit(tree, (node) => {
            if (isMdxJsxFlowElement(node)) {
                const isRequestSnippet = node.name === "EndpointRequestSnippet";
                const isResponseSnippet = node.name === "EndpointResponseSnippet";

                // check that the current node is a request or response snippet
                if (isRequestSnippet || isResponseSnippet) {
                    const props = collectProps(node);

                    if (isRequestSnippet) {
                        if (
                            typeof props.path === "string" &&
                            typeof props.method === "string" &&
                            typeof props.example === "string"
                        ) {
                            // if the request snippet contains all of the
                            // required props, record them and continue to the
                            // next node
                            request = {
                                path: props.path,
                                method: props.method,
                                example: props.example,
                            };

                            // this avoids the request reference from being
                            // reset to undefined at the end of this iteration
                            return CONTINUE;
                        }
                    } else if (
                        !props.example &&
                        request &&
                        request.path === props.path &&
                        request.method === props.method
                    ) {
                        // if the response snippet meets the conditions, copy
                        // the example prop from the request snippet
                        node.attributes.push(toAttribute("example", request.example));
                    }

                    // reset the request reference in all cases (except when the
                    // request snippet props are being recorded)
                    request = undefined;
                }
            }

            return CONTINUE; // this line helps avoid a typescript warning
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
