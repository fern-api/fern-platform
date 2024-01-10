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
        <div className="flex justify-between px-6 md:px-10 lg:pl-12 lg:pr-20 xl:pr-0">
            <div className="w-full lg:pr-6">
                <div className="mx-auto w-full lg:max-w-[72ch]">
                    <header className="my-8">
                        <div className="space-y-2.5">
                            {resolvedPath.sectionTitle != null && (
                                <div className="text-accent-primary dark:text-accent-primary-dark text-xs font-semibold uppercase tracking-wider">
                                    {resolvedPath.sectionTitle}
                                </div>
                            )}

                            <h1 className="inline-block text-3xl">{resolvedPath.page.title}</h1>
                        </div>
                    </header>
                    {content}
                    <BottomNavigationButtons />
                    <div className="h-20" />
                </div>
            </div>
            <TableOfContents
                className="scroll-contain smooth-scroll hide-scrollbar sticky top-16 hidden max-h-[calc(100vh-64px)] w-[19rem] shrink-0 overflow-auto overflow-x-hidden px-8 pb-12 pt-8 xl:block"
                markdown={page?.markdown ?? ""}
            />
        </div>
    );
};
