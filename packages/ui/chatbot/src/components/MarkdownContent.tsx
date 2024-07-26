import { ReactElement } from "react";
import Markdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";

export function MarkdownContent({ children }: { children: string }): ReactElement {
    return (
        <Markdown rehypePlugins={[rehypeRaw]} remarkPlugins={[remarkGfm]} className="prose dark:prose-invert">
            {children}
        </Markdown>
    );
}
