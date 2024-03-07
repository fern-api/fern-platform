import Link from "next/link";
import { ReactElement } from "react";
import { renderToString } from "react-dom/server";
import { Breadcrumbs } from "../api-page/Breadcrumbs";
import { BottomNavigationButtons } from "../bottom-navigation-buttons/BottomNavigationButtons";
import { FernScrollArea } from "../components/FernScrollArea";
import { type SerializedMdxContent } from "../mdx/mdx";
import { MdxContent } from "../mdx/MdxContent";
import { type ResolvedPath } from "../util/ResolvedPath";
import { Feedback } from "./Feedback";
import { HTMLTableOfContents } from "./TableOfContents";

export declare namespace CustomDocsPage {
    export interface Props {
        serializedMdxContent: SerializedMdxContent | undefined;
        resolvedPath: ResolvedPath.CustomMarkdownPage;
    }
}

interface CustomDocsPageHeaderProps {
    sectionTitleBreadcrumbs: string[];
    title: string;
    excerpt: SerializedMdxContent | undefined;
}

export const CustomDocsPageHeader = ({
    sectionTitleBreadcrumbs,
    title,
    excerpt,
}: CustomDocsPageHeaderProps): ReactElement => {
    return (
        <header className="mb-8">
            <div className="space-y-1">
                <Breadcrumbs breadcrumbs={sectionTitleBreadcrumbs} />

                <h1 className="my-0 inline-block leading-tight">{title}</h1>
            </div>

            {excerpt != null && (
                <div className="prose dark:prose-invert prose-p:t-muted prose-lg mt-2 leading-7">
                    <MdxContent mdx={excerpt} />
                </div>
            )}
        </header>
    );
};

export const CustomDocsPage: React.FC<CustomDocsPage.Props> = ({ resolvedPath }) => {
    const mdxContent = <MdxContent mdx={resolvedPath.serializedMdxContent} />;
    let mdxString: string = "";

    try {
        mdxString = renderToString(mdxContent);
    } catch (e) {
        // eslint-disable-next-line no-console
        console.error("Error rendering MDX to string", e);
    }

    const editThisPage =
        typeof resolvedPath.serializedMdxContent !== "string"
            ? resolvedPath.serializedMdxContent.frontmatter.editThisPageUrl ?? resolvedPath?.editThisPageUrl
            : undefined;
    return (
        <div className="flex justify-between px-4 md:px-6 lg:pl-8 lg:pr-16 xl:pr-0">
            <div className="w-full min-w-0 pt-8 lg:pr-8">
                <article className="prose dark:prose-invert prose-h1:mt-[1.5em] first:prose-h1:mt-0 max-w-content-width mx-auto w-full break-words lg:ml-0 xl:mx-auto">
                    <CustomDocsPageHeader
                        title={resolvedPath.title}
                        sectionTitleBreadcrumbs={resolvedPath.sectionTitleBreadcrumbs}
                        excerpt={
                            typeof resolvedPath.serializedMdxContent !== "string"
                                ? resolvedPath.serializedMdxContent.frontmatter.excerpt
                                : undefined
                        }
                    />

                    {mdxContent}
                    <BottomNavigationButtons />
                    <div className="h-20" />
                </article>
            </div>
            <aside
                id="right-sidebar"
                className="top-header-height h-vh-minus-header sticky hidden w-[18rem] shrink-0  xl:block"
            >
                <FernScrollArea viewportClassName="px-4 lg:pr-8 pb-12 pt-8">
                    <HTMLTableOfContents renderedHtml={mdxString} />
                    {editThisPage != null && (
                        <Link
                            href={editThisPage}
                            target="_blank"
                            className="t-muted hover:t-default my-3 block hyphens-auto break-words py-1.5 text-sm leading-5 no-underline transition hover:no-underline"
                        >
                            Edit this page
                        </Link>
                    )}
                    <Feedback className="sticky top-full" />
                </FernScrollArea>
            </aside>
        </div>
    );
};
