import type { MDXRemoteSerializeResult } from "next-mdx-remote";
import { ReactElement } from "react";
import { Breadcrumbs } from "../api-page/Breadcrumbs.js";
import { FernErrorBoundary } from "../components/FernErrorBoundary.js";
import { MdxContent } from "../mdx/MdxContent.js";
import { type SerializedMdxContent } from "../mdx/mdx.js";
import { type ResolvedPath } from "../resolver/ResolvedPath.js";

export declare namespace CustomDocsPage {
    export interface Props {
        serializedMdxContent: SerializedMdxContent | undefined;
        resolvedPath: ResolvedPath.CustomMarkdownPage;
    }
}

interface CustomDocsPageHeaderProps {
    sectionTitleBreadcrumbs: string[];
    title: string;
    excerpt: MDXRemoteSerializeResult | string | undefined;
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
                <div className="prose prose-lg mt-2 leading-7 prose-p:t-muted dark:prose-invert">
                    <MdxContent mdx={excerpt} />
                </div>
            )}
        </header>
    );
};

export const CustomDocsPage: React.FC<CustomDocsPage.Props> = ({ resolvedPath }) => (
    <FernErrorBoundary component="CustomDocsPage">
        <MdxContent mdx={resolvedPath.serializedMdxContent} />
    </FernErrorBoundary>
);
