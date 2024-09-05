import type { FernNavigation } from "@fern-api/fdr-sdk";
import { isPlainObject } from "@fern-ui/core-utils";
import type { ReactElement, ReactNode } from "react";
import { MdxContent } from "../mdx/MdxContent";
import type { BundledMDX } from "../mdx/types";
import { FernBreadcrumbs } from "./FernBreadcrumbs";

interface PageHeaderProps {
    title: string;
    subtitle: BundledMDX | ReactNode | undefined;
    breadcrumbs: readonly FernNavigation.NavigationBreadcrumbItem[];
}

export const PageHeader = ({ breadcrumbs, title, subtitle }: PageHeaderProps): ReactElement => {
    return (
        <header className="mb-8">
            <div className="space-y-1">
                <FernBreadcrumbs breadcrumbs={breadcrumbs} />

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
