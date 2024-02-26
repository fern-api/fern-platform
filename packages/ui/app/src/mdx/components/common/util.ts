import { Children, createElement, isValidElement, ReactNode } from "react";
import { CodeBlockWithClipboardButton } from "../../../commons/CodeBlockWithClipboardButton";
import { FernSyntaxHighlighterContent } from "../../../commons/FernSyntaxHighlighterContent";
import { CodeBlock } from "../CodeBlock";
import { SyntaxHighlighter } from "../SyntaxHighlighter";
import type { CodeBlockItem } from "./types";

/**
 * The interface that the user-provided `CodeBlocks` children should adhere to.
 */
// type ExpectedCodeBlockChildren = {
//     props?: {
//         children?: {
//             props?: {
//                 className?: string;
//                 children?: string;
//             };
//         };
//     };
// };

// function isObject(o: unknown): o is Record<string, unknown> {
//     return typeof o === "object" && o != null;
// }

// function isStringOrNullish(s: unknown): s is string | undefined | null {
//     return typeof s === "string" || s == null;
// }

// function isExpectedCodeBlockChildren(children: ReactNode): children is ExpectedCodeBlockChildren {
//     return (
//         isObject(children) &&
//         isObject(children.props) &&
//         isObject(children.props.children) &&
//         isObject(children.props.children.props) &&
//         isStringOrNullish(children.props.children.props.className) &&
//         isStringOrNullish(children.props.children.props.children)
//     );
// }

/**
 * The interface that the user-provided `CodeBlocks` children should adhere to.
 */
// type ExpectedCodeBlocksChildren = {
//     props: {
//         className?: string;
//         title?: string;
//         children: unknown;
//     };
// };

// function isExpectedCodeBlocksChildren(children: unknown): children is ExpectedCodeBlocksChildren {
//     return (
//         isObject(children) &&
//         isObject(children.props) &&
//         isStringOrNullish(children.props.className) &&
//         isStringOrNullish(children.props.title) &&
//         isExpectedCodeBlockChildren(children.props.children)
//     );
// }

// When the code block children are not of expected shape we return some empty content with a little
// bit of feedback so that the UI doesn't feel buggy
// const fallbackItemForBadlyFormattedCodeBlock: CodeBlockItem = {
//     // language: BADLY_FORMATTED_CODE_BLOCK_LANGUAGE,
//     title: BADLY_FORMATTED_CODE_BLOCK_TITLE,
//     // content: BADLY_FORMATTED_CODE_BLOCK_CONTENT,
//     children: BADLY_FORMATTED_CODE_BLOCK_CONTENT,
// };

/**
 * Transforms the user-provided `CodeBlock` to a `CodeBlockItem` with a cleaner interface
 */
export function transformCodeBlockChildrenToCodeBlockItem(
    title: string | undefined,
    rawChildren: ReactNode,
    highlightLines?: (number | [number, number])[],
    highlightStyle?: "highlight" | "focus",
): CodeBlockItem {
    const [code, children] = unwrapCodeBlockChildren(rawChildren);
    return {
        title,
        code,
        children,
        highlightLines,
        highlightStyle,
    };
}

function unwrapCodeBlockChildren(children: ReactNode): [string, ReactNode] {
    if (!isValidElement(children)) {
        return ["", children];
    }

    if (children.type === SyntaxHighlighter) {
        const { code, children: syntaxHighlighterChildren, ...rest } = children.props;
        return [children.props.code, createElement(FernSyntaxHighlighterContent, rest, syntaxHighlighterChildren)];
    }

    if (children.type === CodeBlockWithClipboardButton) {
        return [children.props.code, children.props.children];
    }

    return ["", children];
}

/**
 * Transforms the user-provided `CodeBlocks` to a `CodeBlockItem` with a cleaner interface
 */
export function transformCodeBlocksChildrenToCodeBlockItem(children: ReactNode): CodeBlockItem[] {
    return Children.toArray(children).map((child) => {
        if (isValidElement(child) && child.type === CodeBlock) {
            return transformCodeBlockChildrenToCodeBlockItem(
                child.props.title,
                child.props.children,
                child.props.highlightLines,
                child.props.highlightStyle,
            );
        }
        return transformCodeBlockChildrenToCodeBlockItem(undefined, child, undefined, undefined);
    });
}
