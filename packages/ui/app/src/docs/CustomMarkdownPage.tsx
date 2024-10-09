import { useSetAtom } from "jotai";
import { ReactElement, useEffect } from "react";
import { WRITE_API_DEFINITION_ATOM } from "../atoms";
import { MdxContent } from "../mdx/MdxContent";
import { DocsContent } from "../resolver/DocsContent";

interface CustomMarkdownPageProps {
    content: DocsContent.CustomMarkdownPage;
}

export function CustomMarkdownPage({ content }: CustomMarkdownPageProps): ReactElement {
    const set = useSetAtom(WRITE_API_DEFINITION_ATOM);
    useEffect(() => {
        Object.values(content.apis).forEach((api) => {
            set(api);
        });
    }, [content.apis, set]);

    return <MdxContent mdx={content.mdx} />;
}
