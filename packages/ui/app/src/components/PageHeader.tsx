import type { FernNavigation } from "@fern-api/fdr-sdk";
import type * as FernDocs from "@fern-api/fdr-sdk/docs";
import { isPlainObject } from "@fern-api/ui-core-utils";
import type { ReactElement, ReactNode } from "react";
import { Markdown } from "../mdx/Markdown";
import { FernBreadcrumbs } from "./FernBreadcrumbs";

interface PageHeaderProps {
    title: string;
    subtitle: FernDocs.MarkdownText | ReactNode | undefined;
    breadcrumb: readonly FernNavigation.BreadcrumbItem[];
}

export const PageHeader = ({ breadcrumb, title, subtitle }: PageHeaderProps): ReactElement => {
    return (
        <header className="mb-8">
            <div className="space-y-1">
                <FernBreadcrumbs breadcrumb={breadcrumb} />

                <h1 className="fern-page-heading">{title}</h1>
            </div>

            <Markdown
                mdx={isResolvedMdx(subtitle) ? subtitle : undefined}
                fallback={!isResolvedMdx(subtitle) ? subtitle : undefined}
                size="lg"
                className="mt-2 leading-7 prose-p:t-muted"
            />
        </header>
    );
};

function isResolvedMdx(node: FernDocs.MarkdownText | ReactNode): node is FernDocs.MarkdownText {
    return typeof node === "string" || (isPlainObject(node) && typeof node.compiledSource === "string");
}
