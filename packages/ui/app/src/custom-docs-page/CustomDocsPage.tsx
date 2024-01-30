import { type DocsNode } from "@fern-api/fdr-sdk";
import { type ResolvedPath, type SerializedMdxContent } from "@fern-ui/app-utils";
import Link from "next/link";
import { ReactElement } from "react";
import { BottomNavigationButtons } from "../bottom-navigation-buttons/BottomNavigationButtons";
import { MdxContent } from "../mdx/MdxContent";
import { TableOfContents } from "./TableOfContents";

export declare namespace CustomDocsPage {
    export interface Props {
        navigatable: DocsNode.Page;
        serializedMdxContent: SerializedMdxContent | undefined;
        resolvedPath: ResolvedPath.CustomMarkdownPage;
    }
}

export const CustomDocsPageHeader = ({ resolvedPath }: Pick<CustomDocsPage.Props, "resolvedPath">): ReactElement => {
    return (
        <header className="my-8">
            <div className="space-y-2.5">
                {resolvedPath.sectionTitle != null && (
                    <div className="text-accent-primary dark:text-accent-primary-dark text-xs font-semibold uppercase tracking-wider">
                        {resolvedPath.sectionTitle}
                    </div>
                )}

                <h1 className="my-0 inline-block text-3xl">{resolvedPath.page.title}</h1>
            </div>
        </header>
    );
};

export const CustomDocsPage: React.FC<CustomDocsPage.Props> = ({ resolvedPath }) => {
    return (
        <div className="flex justify-between px-6 sm:px-8 lg:pl-12 lg:pr-20 xl:pr-0">
            <div className="w-full min-w-0 lg:pr-6">
                <article className="prose dark:prose-invert mx-auto w-full max-w-[70ch] lg:ml-0 xl:mx-auto">
                    <CustomDocsPageHeader resolvedPath={resolvedPath} />
                    <MdxContent mdx={resolvedPath.serializedMdxContent} />
                    <BottomNavigationButtons />
                    <div className="h-20" />
                </article>
            </div>
            <aside className="scroll-contain smooth-scroll hide-scrollbar sticky top-16 hidden max-h-[calc(100vh-86px)] w-[19rem] shrink-0 overflow-auto overflow-x-hidden px-8 pb-12 pt-8 xl:block">
                <TableOfContents tableOfContents={resolvedPath.tableOfContents} />
                {resolvedPath?.editThisPageUrl != null && (
                    <Link
                        href={resolvedPath.editThisPageUrl}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="t-muted hover:dark:text-text-primary-dark hover:text-text-primary-light my-3 block hyphens-auto break-words py-1.5 text-sm leading-5 no-underline transition hover:no-underline"
                    >
                        Edit this page
                    </Link>
                )}
            </aside>
        </div>
    );
};
