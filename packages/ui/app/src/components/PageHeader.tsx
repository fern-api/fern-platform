import { isPlainObject } from "@fern-ui/core-utils";
import { ReactElement, ReactNode } from "react";
import { MdxContent } from "../mdx/MdxContent";
import type { BundledMDX } from "../mdx/types";
import { Breadcrumbs } from "./Breadcrumbs";

interface PageHeaderProps {
    breadcrumbs: string[];
    title: string;
    subtitle: BundledMDX | ReactNode | undefined;
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
                    {isBundledMDX(subtitle) ? <MdxContent mdx={subtitle} /> : subtitle}
                </div>
            )}
        </header>
    );
};

function isBundledMDX(node: BundledMDX | ReactNode): node is BundledMDX {
    return typeof node === "string" || (isPlainObject(node) && typeof node.compiledSource === "string");
}
