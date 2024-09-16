import type { FernNavigation } from "@fern-api/fdr-sdk";
import { isPlainObject } from "@fern-platform/core-utils";
import type { ReactElement, ReactNode } from "react";
import { Markdown } from "../mdx/Markdown";
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

            <Markdown
                mdx={isBundledMDX(subtitle) ? subtitle : undefined}
                fallback={!isBundledMDX(subtitle) ? subtitle : undefined}
                size="lg"
                className="prose-p:t-muted mt-2 leading-7"
            />
        </header>
    );
};

function isBundledMDX(node: BundledMDX | ReactNode): node is BundledMDX {
    return typeof node === "string" || (isPlainObject(node) && typeof node.compiledSource === "string");
}
