import { parseCodeBlockLanguageFromClassName } from "../../../commons/util";
import {
    BADLY_FORMATTED_CODE_BLOCK_CONTENT,
    BADLY_FORMATTED_CODE_BLOCK_LANGUAGE,
    BADLY_FORMATTED_CODE_BLOCK_TITLE,
    DEFAULT_CODE_BLOCK_CONTENT,
} from "../../../config";
import type { CodeBlockItem } from "./types";

/**
 * The interface that the user-provided `CodeBlocks` children should adhere to.
 */
type ExpectedCodeBlockChildren = {
    props?: {
        children?: {
            props?: {
                className?: string;
                children?: string;
            };
        };
    };
};

function isObject(o: unknown): o is Record<string, unknown> {
    return typeof o === "object" && o != null;
}

function isStringOrNullish(s: unknown): s is string | undefined | null {
    return typeof s === "string" || s == null;
}

function isExpectedCodeBlockChildren(children: unknown): children is ExpectedCodeBlockChildren {
    return (
        isObject(children) &&
        isObject(children.props) &&
        isObject(children.props.children) &&
        isObject(children.props.children.props) &&
        isStringOrNullish(children.props.children.props.className) &&
        isStringOrNullish(children.props.children.props.children)
    );
}

/**
 * The interface that the user-provided `CodeBlocks` children should adhere to.
 */
type ExpectedCodeBlocksChildren = {
    props: {
        className?: string;
        title?: string;
        children: unknown;
    };
};

function isExpectedCodeBlocksChildren(children: unknown): children is ExpectedCodeBlocksChildren {
    return (
        isObject(children) &&
        isObject(children.props) &&
        isStringOrNullish(children.props.className) &&
        isStringOrNullish(children.props.title) &&
        isExpectedCodeBlockChildren(children.props.children)
    );
}

// When the code block children are not of expected shape we return some empty content with a little
// bit of feedback so that the UI doesn't feel buggy
const fallbackItemForBadlyFormattedCodeBlock: CodeBlockItem = {
    language: BADLY_FORMATTED_CODE_BLOCK_LANGUAGE,
    title: BADLY_FORMATTED_CODE_BLOCK_TITLE,
    content: BADLY_FORMATTED_CODE_BLOCK_CONTENT,
};

/**
 * Transforms the user-provided `CodeBlock` to a `CodeBlockItem` with a cleaner interface
 */
export function transformCodeBlockChildrenToCodeBlockItem(title: string | undefined, children: unknown): CodeBlockItem {
    if (!isExpectedCodeBlockChildren(children)) {
        return fallbackItemForBadlyFormattedCodeBlock;
    }
    const language = parseCodeBlockLanguageFromClassName(children?.props?.children?.props?.className);
    return {
        language,
        title: title ?? language,
        content: children?.props?.children?.props?.children ?? DEFAULT_CODE_BLOCK_CONTENT,
    };
}

/**
 * Transforms the user-provided `CodeBlocks` to a `CodeBlockItem` with a cleaner interface
 */
export function transformCodeBlocksChildrenToCodeBlockItem(children: unknown): CodeBlockItem {
    if (!isExpectedCodeBlocksChildren(children)) {
        return fallbackItemForBadlyFormattedCodeBlock;
    }
    return transformCodeBlockChildrenToCodeBlockItem(children.props.title, children.props.children);
}
