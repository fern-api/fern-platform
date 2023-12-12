import { type DocsNode } from "@fern-api/fdr-sdk";
import { type ResolvedPath, type SerializedMdxContent } from "@fern-ui/app-utils";
import { useMemo } from "react";
import { BottomNavigationButtons } from "../bottom-navigation-buttons/BottomNavigationButtons";
import { HEADER_HEIGHT } from "../constants";
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
        <div className="flex justify-between space-x-16 px-6 md:px-12">
            <div className="ml-[calc(50vw-752px)] w-full min-w-0 max-w-3xl pt-12">
                {resolvedPath.sectionTitle != null && (
                    <div className="text-accent-primary mb-4 text-xs font-semibold uppercase tracking-wider">
                        {resolvedPath.sectionTitle}
                    </div>
                )}

                <div className="text-text-primary-light dark:text-text-primary-dark mb-8 text-3xl font-bold">
                    {resolvedPath.page.title}
                </div>
                {content}
                <BottomNavigationButtons />
                <div className="h-20" />
            </div>
            <div className="hidden w-64 xl:flex">
                <TableOfContents
                    className="sticky w-full overflow-auto overflow-x-hidden py-8"
                    markdown={page.markdown}
                    style={{
                        maxHeight: `calc(100vh - ${HEADER_HEIGHT}px)`,
                        top: HEADER_HEIGHT,
                    }}
                />
            </div>
        </div>
    );
};
