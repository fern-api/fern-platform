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

        visit(tree, (node, index, parent) => {
            if (index == null || parent == null) {
                return;
            }

            if (isMdxJsxFlowElement(node) && node.name === "iframe") {
                // check that iframe is a youtube video

                const src = node.attributes.find(
                    (attr) => attr.type === "mdxJsxAttribute" && attr.name === "src",
                )?.value;
                if (src != null && typeof src === "string" && src.startsWith("https://www.youtube.com/embed/")) {
                    // regex to match youtube video id
                    // https://www.youtube.com/embed/VIDEO_ID?...
                    // https://www.youtube.com/embed/VIDEO_ID

                    const youtubeEmbedRegex = /https:\/\/www\.youtube\.com\/embed\/([a-zA-Z0-9_-]+)/;
                    const match = youtubeEmbedRegex.exec(src)?.[1];
                    if (match != null) {
                        parent.children.splice(index, 1, {
                            type: "mdxJsxFlowElement",
                            name: "YoutubeVideo",
                            attributes: [toAttribute("videoId", match, valueToEstree(match))],
                            children: [],
                        });
                    }
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
