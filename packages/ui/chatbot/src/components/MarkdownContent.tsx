import clsx from "clsx";
import { last } from "es-toolkit/array";
import type { Root } from "hast";
import { h } from "hastscript";
import { ReactElement } from "react";
import Markdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

function rehypeTerminator({ terminator = false }: { terminator?: boolean }) {
    return (tree: Root) => {
        if (!terminator) {
            return tree;
        }

        const span = h("span", { class: "fern-chatbot-terminator" });

        const lastChild = last(tree.children);

        if (lastChild?.type === "element" && lastChild.tagName === "p") {
            lastChild.children.push(span);
        } else {
            tree.children.push(h("p", span));
        }

        return tree;
    };
}

export function MarkdownContent({
    children,
    className,
    terminator,
    components,
}: {
    children: string;
    className?: string;
    terminator?: boolean;
    components?: Components;
}): ReactElement {
    return (
        <Markdown
            components={components}
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[[rehypeTerminator, { terminator }]]}
            className={clsx("prose dark:prose-invert", className)}
        >
            {children}
        </Markdown>
    );
}
