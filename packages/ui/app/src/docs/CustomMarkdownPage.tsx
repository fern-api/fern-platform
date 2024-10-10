import { ReactElement } from "react";
import { useWriteApiDefinitionsAtom } from "../atoms";
import { MdxContent } from "../mdx/MdxContent";
import { DocsContent } from "../resolver/DocsContent";

interface CustomMarkdownPageProps {
    content: DocsContent.CustomMarkdownPage;
}

export function CustomMarkdownPage({ content }: CustomMarkdownPageProps): ReactElement {
    useWriteApiDefinitionsAtom(content.apis);
    return <MdxContent mdx={content.mdx} />;
}
