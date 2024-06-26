import { isPlainObject } from "@fern-ui/core-utils";
import { MDXRemoteSerializeResult } from "next-mdx-remote";
import { ReactElement, ReactNode } from "react";
import { Breadcrumbs } from "../api-page/Breadcrumbs";
import { MdxContent } from "../mdx/MdxContent";

interface MarkdownHeaderProps {
    breadcrumbs: string[];
    title: string;
    subtitle: MDXRemoteSerializeResult | ReactNode | undefined;
}

export const MarkdownHeader = ({ breadcrumbs, title, subtitle }: MarkdownHeaderProps): ReactElement => {
    return (
        <header className="mb-8">
            <div className="space-y-1">
                <Breadcrumbs breadcrumbs={breadcrumbs} />

                <h1 className="my-0 inline-block leading-tight">{title}</h1>
            </div>

            {subtitle != null && (
                <div className="prose dark:prose-invert prose-p:t-muted prose-lg mt-2 leading-7 prose-p:max-w-content-wide-width max-w-content-wide-width">
                    {isMdxRemoteSerializeResult(subtitle) ? <MdxContent mdx={subtitle} /> : subtitle}
                </div>
            )}
        </header>
    );
};

function isMdxRemoteSerializeResult(node: MDXRemoteSerializeResult | ReactNode): node is MDXRemoteSerializeResult {
    return isPlainObject(node) && typeof node.compiledSource === "string";
}
