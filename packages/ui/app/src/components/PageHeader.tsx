import { isPlainObject } from "@fern-ui/core-utils";
import { MDXRemoteSerializeResult } from "next-mdx-remote";
import { ReactElement, ReactNode } from "react";
import { MdxContent } from "../mdx/MdxContent";
import { Breadcrumbs } from "./Breadcrumbs";

interface PageHeaderProps {
    breadcrumbs: string[];
    title: string;
    subtitle: MDXRemoteSerializeResult | ReactNode | undefined;
}

export const PageHeader = ({ breadcrumbs, title, subtitle }: PageHeaderProps): ReactElement => {
    return (
        <header className="mb-8">
            <div className="space-y-1">
                <Breadcrumbs breadcrumbs={breadcrumbs} />

                <h1 className="fern-page-heading">{title}</h1>
            </div>

            {subtitle != null && (
                <div className="prose prose-lg mt-2 leading-7 prose-p:t-muted dark:prose-invert">
                    {isMdxRemoteSerializeResult(subtitle) ? <MdxContent mdx={subtitle} /> : subtitle}
                </div>
            )}
        </header>
    );
};

function isMdxRemoteSerializeResult(node: MDXRemoteSerializeResult | ReactNode): node is MDXRemoteSerializeResult {
    return isPlainObject(node) && typeof node.compiledSource === "string";
}
