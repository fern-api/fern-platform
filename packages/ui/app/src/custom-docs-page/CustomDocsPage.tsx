import { DocsV1Read, type DocsNode } from "@fern-api/fdr-sdk";
import { type ResolvedPath, type SerializedMdxContent } from "@fern-ui/app-utils";
import { visitDiscriminatedUnion } from "@fern-ui/core-utils";
import Link from "next/link";
import { ReactElement, useMemo } from "react";
import { BottomNavigationButtons } from "../bottom-navigation-buttons/BottomNavigationButtons";
import { useDocsContext } from "../docs-context/useDocsContext";
import { MdxContent } from "../mdx/MdxContent";
import { TableOfContents } from "./TableOfContents";

export declare namespace CustomDocsPage {
    export interface Props {
        navigatable: DocsNode.Page;
        serializedMdxContent: SerializedMdxContent | undefined;
        resolvedPath: ResolvedPath.CustomMarkdownPage;
        contentWidth: DocsV1Read.SizeConfig | undefined;
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

export const CustomDocsPage: React.FC<CustomDocsPage.Props> = ({
    serializedMdxContent,
    resolvedPath,
    contentWidth,
}) => {
    const { resolvePage } = useDocsContext();

    const page = useMemo(() => resolvePage(resolvedPath.page.id), [resolvedPath.page.id, resolvePage]);

    const content = useMemo(() => {
        return serializedMdxContent != null ? <MdxContent mdx={serializedMdxContent} /> : null;
    }, [serializedMdxContent]);

    return (
        <div className="flex justify-between px-6 sm:px-8 lg:pl-12 lg:pr-20 xl:pr-0">
            <div className="w-full min-w-0 lg:pr-6">
                <article
                    className="prose dark:prose-invert w-full"
                    style={{
                        maxWidth:
                            contentWidth == null
                                ? "44rem"
                                : visitDiscriminatedUnion(contentWidth, "type")._visit({
                                      px: (px) => `${px.value}px`,
                                      rem: (rem) => `${rem.value}rem`,
                                      _other: () => "44rem",
                                  }),
                    }}
                >
                    <CustomDocsPageHeader resolvedPath={resolvedPath} />
                    {content}
                    <BottomNavigationButtons />
                    <div className="h-20" />
                </article>
            </div>
            <aside className="scroll-contain smooth-scroll hide-scrollbar sticky top-16 hidden max-h-[calc(100vh-64px)] w-[19rem] shrink-0 overflow-auto overflow-x-hidden px-8 pb-12 pt-8 xl:block">
                <TableOfContents markdown={page?.markdown ?? ""} />
                {page?.editThisPageUrl != null && (
                    <Link
                        href={page.editThisPageUrl}
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
