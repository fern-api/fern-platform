import { isMdxExpression, isMdxJsxElement, mdastToString, toTree, visit } from "@fern-ui/fern-docs-mdx";

interface PreparedMdxContent {
    content: string;
    code_snippets?: { lang: string | undefined; meta: string | undefined; code: string }[];
}

export function maybePrepareMdxContent(content: string | undefined): Partial<PreparedMdxContent> {
    if (content == null) {
        return { content: undefined, code_snippets: undefined };
    }
    return prepareMdxContent(content);
}

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
            parent.children.splice(index, 1, { type: "break" }, ...node.children);
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

        return true;
    });
    return {
        content: mdastToString(tree, { includeHtml: false, includeImageAlt: true, preserveNewlines: true }).trim(),
        code_snippets: code_snippets.length > 0 ? code_snippets : undefined,
    };
}
