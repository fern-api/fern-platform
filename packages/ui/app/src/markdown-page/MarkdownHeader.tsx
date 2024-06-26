import { MDXRemoteSerializeResult } from "next-mdx-remote";
import { ReactElement } from "react";
import { Breadcrumbs } from "../api-page/Breadcrumbs";
import { MdxContent } from "../mdx/MdxContent";

interface MarkdownHeaderProps {
    sectionTitleBreadcrumbs: string[];
    title: string;
    subtitle: MDXRemoteSerializeResult | string | undefined;
}

export const MarkdownHeader = ({ sectionTitleBreadcrumbs, title, subtitle }: MarkdownHeaderProps): ReactElement => {
    return (
        <header className="mb-8">
            <div className="space-y-1">
                <Breadcrumbs breadcrumbs={sectionTitleBreadcrumbs} />

                <h1 className="my-0 inline-block leading-tight">{title}</h1>
            </div>

            {subtitle != null && (
                <div className="prose prose-lg mt-2 leading-7 prose-p:t-muted dark:prose-invert">
                    <MdxContent mdx={subtitle} />
                </div>
            )}
        </header>
    );
};
