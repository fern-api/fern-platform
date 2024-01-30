import { type DocsNode } from "@fern-api/fdr-sdk";
import { type ResolvedPath, type SerializedMdxContent } from "@fern-ui/app-utils";
import Link from "next/link";
import { ReactElement } from "react";
import { renderToString } from "react-dom/server";
import { BottomNavigationButtons } from "../bottom-navigation-buttons/BottomNavigationButtons";
import { ArrowRightIcon } from "../commons/icons/ArrowRightIcon";
import { MdxContent } from "../mdx/MdxContent";
import { TableOfContents } from "./TableOfContents";
import { TableOfContentsContextProvider } from "./TableOfContentsContext";

export declare namespace CustomDocsPage {
    export interface Props {
        navigatable: DocsNode.Page;
        serializedMdxContent: SerializedMdxContent | undefined;
        resolvedPath: ResolvedPath.CustomMarkdownPage;
        maxContentWidth: string;
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

                <h1 className="!my-0 inline-block">{resolvedPath.page.title}</h1>
            </div>
        </header>
    );
};

export const CustomDocsPage: React.FC<CustomDocsPage.Props> = ({ resolvedPath, maxContentWidth }) => {
    const mdxContent = <MdxContent mdx={resolvedPath.serializedMdxContent} />;
    const mdxString = renderToString(mdxContent);
    return (
        <TableOfContentsContextProvider>
            <div
                className={
                    "flex flex-1 justify-start px-4 sm:px-8 lg:px-12 xl:pr-0 " +
                    "bg-[#FAFAFA] border border-[#E0E0E0] rounded-lg mb-3 mx-3 lg:ml-0"
                }
            >
                <article
                    className="prose dark:prose-invert mx-auto w-full xl:ml-0 xl:mr-12"
                    style={{ maxWidth: maxContentWidth }}
                >
                    <CustomDocsPageHeader resolvedPath={resolvedPath} />
                    {mdxContent}
                    <BottomNavigationButtons />
                    <div className="h-8" />
                </article>
                <aside className="scroll-contain smooth-scroll hide-scrollbar sticky top-16 hidden max-h-[calc(100vh-86px)] w-[19rem] shrink-0 overflow-auto overflow-x-hidden px-8 pb-12 pt-8 xl:block">
                    <TableOfContents renderedHtml={mdxString} />
                    {resolvedPath?.editThisPageUrl != null && (
                        <Link
                            href={resolvedPath.editThisPageUrl}
                            target="_blank"
                            rel="noreferrer noopener"
                            className="t-muted hover:dark:text-text-primary-dark hover:text-text-primary-light group my-3 flex items-center gap-1 hyphens-auto break-words py-1.5 text-sm leading-5 no-underline transition hover:no-underline"
                        >
                            <span>Edit this page</span>
                            <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                        </Link>
                    )}
                </aside>
            </div>
        </TableOfContentsContextProvider>
    );
};
