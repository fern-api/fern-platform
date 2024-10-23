import { unknownToString } from "@fern-api/ui-core-utils";
import { isElement, isMdxJsxFlowElement, isText, toAttribute } from "@fern-ui/fern-docs-mdx";
import type { Element, Root } from "hast";
import type { MdxJsxAttribute, MdxJsxFlowElementHast } from "mdast-util-mdx-jsx";
import rangeParser from "parse-numeric-range";
import { visit } from "unist-util-visit";
import type { FernSyntaxHighlighterProps } from "../../syntax-highlighting/FernSyntaxHighlighter";
import type { CodeGroup } from "../components/code";

declare module "hast" {
    interface ElementData {
        visited?: boolean;
        meta?: string | null;
        metastring?: string;
    }
}

export function rehypeFernCode(): (tree: Root) => void {
    return async function (tree: Root): Promise<void> {
        // match CodeBlocks and its CodeBlock children
        visit(tree, (node, index, parent) => {
            if (index == null) {
                return;
            }

            if (isMdxJsxFlowElement(node) && (node.name === "CodeBlocks" || node.name === "CodeGroup")) {
                const codeBlockItems = visitCodeBlockNodes(node);
                parent?.children.splice(index, 1, {
                    type: "mdxJsxFlowElement",
                    name: "CodeBlocks",
                    attributes: [toAttribute("items", codeBlockItems)],
                    children: [],
                });
                return "skip";
            }

            if (isMdxJsxFlowElement(node) && node.name === "CodeBlock") {
                const codeBlockItems = visitCodeBlockNodes(node);
                if (codeBlockItems.length === 0) {
                    parent?.children.splice(index, 1);
                } else if (
                    codeBlockItems.length === 1 &&
                    codeBlockItems[0] != null &&
                    codeBlockItems[0].title == null
                ) {
                    parent?.children.splice(index, 1, {
                        type: "mdxJsxFlowElement",
                        name: "CodeBlock",
                        attributes: Object.entries(codeBlockItems[0]).map(([key, value]) => toAttribute(key, value)),
                        children: [],
                    });
                } else {
                    parent?.children.splice(index, 1, {
                        type: "mdxJsxFlowElement",
                        name: "CodeBlocks",
                        attributes: [toAttribute("items", codeBlockItems)],
                        children: [],
                    });
                }
                return "skip";
            }

            // neither CodeBlocks nor CodeBlock were matched, so we need to check for raw code blocks
            if (isElement(node) && isBlockCode(node) && node.data?.visited !== true) {
                node.data = { visited: true, ...node.data };
                const head = node.children.filter(isElement).find((child) => child.tagName === "code");
                if (head != null) {
                    const code = getCode(head);

                    if (code == null) {
                        parent?.children.splice(index, 1);
                        return;
                    }

                    const meta = parseBlockMetaString(head, "plaintext");
                    const props: FernSyntaxHighlighterProps = {
                        code,
                        language: meta.lang,
                        highlightLines: meta.highlights,
                        highlightStyle: meta.focused ? "focus" : "highlight",
                        maxLines: meta.maxLines,
                        wordWrap: meta.wordWrap,
                    };
                    if (meta.title == null) {
                        parent?.children.splice(index, 1, {
                            type: "mdxJsxFlowElement",
                            name: "CodeBlock",
                            // attributes: [toAttribute("tokens", JSON.stringify(highlighted), valueToEstree(highlighted))],
                            attributes: Object.entries(props).map(([key, value]) => toAttribute(key, value)),
                            children: [],
                        });
                    } else {
                        const itemsProps: [CodeGroup.Item] = [{ ...props, title: meta.title }];
                        parent?.children.splice(index, 1, {
                            type: "mdxJsxFlowElement",
                            name: "CodeBlocks",
                            attributes: [toAttribute("items", itemsProps)],
                            children: [],
                        });
                    }
                }
            }

            return true;
        });
    };
}

interface CodeBlockItem {
    code: string;
    language: string;
    highlightLines: number[];
    highlightStyle: "focus" | "highlight";
    maxLines: number | undefined;
    title: string | undefined;
    wordWrap: boolean | undefined;
}

function visitCodeBlockNodes(nodeToVisit: MdxJsxFlowElementHast) {
    const codeBlockItems: CodeBlockItem[] = [];
    visit(nodeToVisit, (node) => {
        if (isMdxJsxFlowElement(node) && node.name === "CodeBlock") {
            const jsxAttributes = node.attributes.filter(
                (attr) => attr.type === "mdxJsxAttribute",
            ) as MdxJsxAttribute[];
            const title = jsxAttributes.find((attr) => attr.name === "title");
            visit(node, "element", (child) => {
                if (child.tagName === "code" && child.data?.visited !== true) {
                    node.data = { visited: true, ...node.data };
                    const code = getCode(child);
                    const meta = parseBlockMetaString(child, "plaintext");
                    if (code != null) {
                        codeBlockItems.push({
                            code,
                            language: meta.lang,
                            highlightLines: meta.highlights,
                            highlightStyle: meta.focused ? "focus" : "highlight",
                            maxLines: meta.maxLines,
                            title:
                                meta.title ??
                                (typeof title?.value === "string"
                                    ? title.value
                                    : title?.value?.type === "mdxJsxAttributeValueExpression"
                                      ? title.value.value
                                      : undefined),
                            wordWrap: meta.wordWrap,
                        });
                    }
                }
            });
            return "skip";
        }

        if (isElement(node) && node.tagName === "code" && node.data?.visited !== true) {
            node.data = { visited: true, ...node.data };
            const code = getCode(node);
            const meta = parseBlockMetaString(node, "plaintext");
            if (code != null) {
                codeBlockItems.push({
                    code,
                    language: meta.lang,
                    highlightLines: meta.highlights,
                    highlightStyle: meta.focused ? "focus" : "highlight",
                    maxLines: meta.maxLines,
                    title: meta.title,
                    wordWrap: meta.wordWrap,
                });
            }
        }
        return true;
    });
    return codeBlockItems;
}

function getCode(node: Element): string | undefined {
    const code = node.children.find(isText)?.value;

    if (code == null || code.length === 0) {
        return;
    }
    return code;
}

export function isBlockCode(element: Element): element is Element {
    return (
        element.tagName === "pre" &&
        Array.isArray(element.children) &&
        element.children.length === 1 &&
        isElement(element.children[0]) &&
        element.children[0].tagName === "code"
    );
}

interface FernCodeMeta {
    title: string | undefined;
    maxLines: number | undefined;
    lang: string;
    focused?: boolean;
    wordWrap?: boolean;
    highlights: number[];
}

function maybeParseInt(str: string | null | undefined): number | undefined {
    if (str == null) {
        return undefined;
    }
    const num = parseInt(str, 10);
    return isNaN(num) ? undefined : num;
}

export function parseBlockMetaString(element: Element, defaultFallback: string = "plaintext"): FernCodeMeta {
    const originalMeta: string = unknownToString(element.data?.meta ?? element.properties?.metastring ?? "").trim();
    let meta = originalMeta;

    const titleMatch = meta.match(/title=(?:"((?:[^"\\]|\\.)*?)"|'((?:[^'\\]|\\.)*?)')/);
    let title = titleMatch?.[1] ?? titleMatch?.[2];
    meta = meta.replace(titleMatch?.[0] ?? "", "");

    const fileName = meta.match(/fileName=(?:"((?:[^"\\]|\\.)*?)"|'((?:[^'\\]|\\.)*?)')/);
    title = title ?? fileName?.[1] ?? fileName?.[2];
    meta = meta.replace(fileName?.[0] ?? "", "");

    const filename = meta.match(/filename=(?:"((?:[^"\\]|\\.)*?)"|'((?:[^'\\]|\\.)*?)')/);
    title = title ?? filename?.[1] ?? filename?.[2];
    meta = meta.replace(filename?.[0] ?? "", "");

    // i.e. maxLines=20 (default is 20)
    const maxLinesMatch = meta.match(/maxLines=(\d+)/);
    let maxLines: number | undefined = maybeParseInt(maxLinesMatch?.[1]) ?? 20;
    meta = meta.replace(maxLinesMatch?.[0] ?? "", "");

    const fullHeight = meta.match(/fullHeight/);
    if (fullHeight) {
        maxLines = undefined;
        meta = meta.replace(fullHeight[0], "");
    }

    const focused = meta.match(/focus/);
    if (focused) {
        meta = meta.replace(focused[0], "");
    }

    const wordWrap = meta.match(/wordWrap/);
    if (wordWrap) {
        meta = meta.replace(wordWrap[0], "");
    }

    const [highlights, strippedMeta] = parseHighlightedLineNumbers(meta);
    meta = strippedMeta;

    if (originalMeta === meta && meta.length > 0 && title == null) {
        title = meta;
    }

    // unescape quotes
    title = title?.replace(/\\"/g, '"').replace(/\\'/g, "'").replace(/\\`/g, "`");

    let lang = defaultFallback;
    if (
        element.properties &&
        Array.isArray(element.properties.className) &&
        typeof element.properties.className[0] === "string" &&
        element.properties.className[0].startsWith("language-")
    ) {
        lang = element.properties.className[0].replace("language-", "");
    }

    return {
        title,
        maxLines,
        lang,
        focused: focused != null,
        wordWrap: wordWrap != null,
        highlights,
    };
}

function parseHighlightedLineNumbers(meta: string): [number[], string] {
    const lineNumbers: number[] = [];
    const matches = meta.matchAll(/\{(.*?)\}/g);
    for (const match of matches) {
        if (match[1]) {
            lineNumbers.push(...rangeParser(match[1]));
        }
        meta = meta.replace(match[0], "");
    }

    return [lineNumbers, meta];
}
