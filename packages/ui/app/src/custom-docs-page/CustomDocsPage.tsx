import { type DocsNode } from "@fern-api/fdr-sdk";
import { type ResolvedPath, type SerializedMdxContent } from "@fern-ui/app-utils";
import { useMemo } from "react";
import { BottomNavigationButtons } from "../bottom-navigation-buttons/BottomNavigationButtons";
import { useDocsContext } from "../docs-context/useDocsContext";
import { MdxContent } from "../mdx/MdxContent";
import { TableOfContents } from "./TableOfContents";

export declare namespace CustomDocsPage {
    export interface Props {
        navigatable: DocsNode.Page;
        serializedMdxContent: SerializedMdxContent | undefined;
        resolvedPath: ResolvedPath.CustomMarkdownPage;
    }
}

export const CustomDocsPage: React.FC<CustomDocsPage.Props> = ({ serializedMdxContent, resolvedPath }) => {
    const { resolvePage } = useDocsContext();

    const page = useMemo(() => resolvePage(resolvedPath.page.id), [resolvedPath.page.id, resolvePage]);

    const content = useMemo(() => {
        return serializedMdxContent != null ? <MdxContent mdx={serializedMdxContent} /> : null;
    }, [serializedMdxContent]);

    return (
        <div className="flex space-x-16 px-6 md:px-12">
            <div className="w-full min-w-0 max-w-3xl pt-8">
                <header className="mb-8">
                    <div className="space-y-2.5">
                        {resolvedPath.sectionTitle != null && (
                            <div className="text-accent-primary dark:text-accent-primary-dark text-xs font-semibold uppercase tracking-wider">
                                {resolvedPath.sectionTitle}
                            </div>
                        )}

                        <h1 className="inline-block text-2xl sm:text-3xl">{resolvedPath.page.title}</h1>
                    </div>
                </header>
                {content}
                <BottomNavigationButtons />
                <div className="h-20" />
            </div>
            <div className="hidden w-64 xl:flex">
                <TableOfContents
                    className="sticky top-16 max-h-[calc(100vh-64px)] w-full overflow-auto overflow-x-hidden py-8"
                    markdown={page.markdown}
                />
            </div>
        </div>
    );
};
