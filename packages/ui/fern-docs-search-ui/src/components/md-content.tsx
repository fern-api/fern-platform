import clsx from "clsx";
import type { Root } from "mdast";
import { ReactElement } from "react";
import Markdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { visit } from "unist-util-visit";

export function MarkdownContent({
    children,
    className,
    components,
}: {
    children: string;
    className?: string;
    components?: Components;
}): ReactElement {
    return (
        <Markdown
            components={components}
            remarkPlugins={[remarkGfm, remarkTest]}
            // rehypePlugins={[rehypeThinking]}
            remarkRehypeOptions={{}}
            className={clsx("prose dark:prose-invert", className)}
        >
            {children}
        </Markdown>
    );
}

function remarkTest() {
    return (tree: Root) => {
        visit(tree, "text", (node) => {
            const match = node.value.matchAll(/\[\^[0-9]+\]/g);
            if (match) {
                for (const m of match) {
                    node.value = node.value.replace(m[0], "");
                }
            }
        });
    };
}
