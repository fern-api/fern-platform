import {
    isMdxExpression,
    isMdxJsxElement,
    mdastToString,
    toTree,
    visit,
} from "@fern-docs/mdx";
import { decode } from "html-entities";

interface PreparedMdxContent {
    content: string | undefined;
    code_snippets:
        | { lang: string | undefined; meta: string | undefined; code: string }[]
        | undefined;
}

export function maybePrepareMdxContent(
    content: string | undefined
): PreparedMdxContent {
    if (content == null) {
        return { content: undefined, code_snippets: undefined };
    }
    return prepareMdxContent(content);
}

// TODO: this function needs to be updated to handle markdown snippets imported via mdxjsEsm
export function prepareMdxContent(content: string): PreparedMdxContent {
    const tree = toTree(content).mdast;
    const code_snippets: PreparedMdxContent["code_snippets"] = [];
    visit(tree, (node, index, parent) => {
        if (index == null || parent == null) {
            return;
        }

        // delete mdxjsEsm, mdxFlowExpression, and mdxJsxTextElement nodes
        // because they are javascript expressions and not valid for search
        if (node.type === "mdxjsEsm" || isMdxExpression(node)) {
            parent.children.splice(index, 1, { type: "break" });
            return index + 1;
        }

        // squeeze MdxJsxElements to include only its children
        if (isMdxJsxElement(node)) {
            parent.children.splice(
                index,
                1,
                { type: "break" },
                ...node.children
            );
            return index + 1;
        }

        if (node.type === "code") {
            code_snippets.push({
                lang: node.lang ?? undefined,
                meta: node.meta ?? undefined,
                code: node.value,
            });
            parent.children.splice(index, 1);
            return index;
        }

        if (node.type === "text" || node.type === "html") {
            // replace all html entities with their corresponding characters
            node.value = decode(node.value);
        }

        return true;
    });

    const stringifiedContent = mdastToString(tree, {
        includeHtml: false,
        includeImageAlt: true,
        preserveNewlines: true,
    }).trim();

    return {
        content:
            stringifiedContent.trimStart().length > 0
                ? stringifiedContent
                : undefined,
        code_snippets: code_snippets.length > 0 ? code_snippets : undefined,
    };
}
