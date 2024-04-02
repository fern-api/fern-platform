import { RouterContext } from "next/dist/shared/lib/router-context.shared-runtime";
import Link from "next/link";
import { useRouter } from "next/router";
import { ReactElement } from "react";
import { renderToString } from "react-dom/server";
import { emitDatadogError } from "../analytics/datadogRum";
import { Breadcrumbs } from "../api-page/Breadcrumbs";
import { BottomNavigationButtons } from "../components/BottomNavigationButtons";
import { FernErrorBoundary } from "../components/FernErrorBoundary";
import { FernScrollArea } from "../components/FernScrollArea";
import { MdxContent } from "../mdx/MdxContent";
import { type SerializedMdxContent } from "../mdx/mdx";
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
    const router = useRouter();
    const mdxContent = <MdxContent mdx={resolvedPath.serializedMdxContent} />;
    let mdxString: string = "";

    try {
        mdxString = renderToString(<RouterContext.Provider value={router}>{mdxContent}</RouterContext.Provider>);
    } catch (e) {
        // eslint-disable-next-line no-console
        console.error("Error rendering MDX to string", e);

        emitDatadogError(e, {
            context: "CustomDocsPage",
            errorSource: "renderToString",
            errorDescription: "Error occurred while rendering MDX to string for the table of contents",
        });
    }

    const editThisPage =
        typeof resolvedPath.serializedMdxContent !== "string"
            ? resolvedPath.serializedMdxContent.frontmatter.editThisPageUrl ?? resolvedPath?.editThisPageUrl
            : undefined;
    return (
        <div className="relative flex justify-between px-4 md:px-6 lg:pl-8 lg:pr-16 xl:pr-0">
            <div className="z-10 w-full min-w-0 pt-8 lg:pr-8">
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

                    <FernErrorBoundary component="CustomDocsPage">{mdxContent}</FernErrorBoundary>
                    <BottomNavigationButtons />
                    <div className="h-20" />
                </article>
            </div>
            <aside
                id="right-sidebar"
                className="top-header-height h-vh-minus-header sticky hidden w-[18rem] shrink-0 xl:block"
            >
                <FernScrollArea className="px-4 pb-12 pt-8 lg:pr-8" scrollbars="vertical">
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
