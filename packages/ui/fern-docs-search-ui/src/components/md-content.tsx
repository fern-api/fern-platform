import clsx from "clsx";
import { ReactElement } from "react";
import Markdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

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
            remarkPlugins={[remarkGfm]}
            // rehypePlugins={[rehypeThinking]}
            remarkRehypeOptions={{}}
            className={clsx("prose dark:prose-invert", className)}
        >
            {children}
        </Markdown>
    );
}
