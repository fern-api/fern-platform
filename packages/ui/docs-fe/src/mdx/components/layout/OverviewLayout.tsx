import type { FernNavigation } from "@fern-api/fdr-sdk";
import { FernScrollArea } from "@fern-ui/components";
import type { ElementContent } from "hast";
import type { MdxJsxFlowElementHast } from "mdast-util-mdx-jsx";
import { ReactElement, ReactNode } from "react";
import { EditThisPageButton } from "../../../components/EditThisPage";
import { PageHeader } from "../../../components/PageHeader";
import { TableOfContents } from "../../../components/table-of-contents/TableOfContents";
import type { TableOfContentsItem } from "../../../components/table-of-contents/TableOfContentsItem";
import { Feedback } from "../../../feedback/Feedback";
import { BuiltWithFern } from "../../../sidebar/BuiltWithFern";
import { toAttribute } from "../../plugins/utils";

interface OverviewLayoutProps {
    breadcrumbs: readonly FernNavigation.NavigationBreadcrumbItem[];
    title: string;
    subtitle: ReactNode | undefined;
    tableOfContents: TableOfContentsItem[] | undefined;
    children: ReactNode;
    editThisPageUrl: string | undefined;
    hideFeedback: boolean | undefined;
}

interface OverviewLayoutOpts {
    breadcrumbs: readonly FernNavigation.NavigationBreadcrumbItem[];
    title: string;
    subtitle: ElementContent | undefined;
    tableOfContents: TableOfContentsItem[] | undefined;
    children: ElementContent[];
    editThisPageUrl: string | undefined;
    hideFeedback: boolean | undefined;
}

export function OverviewLayout({
    breadcrumbs,
    title,
    tableOfContents,
    subtitle,
    children,
    editThisPageUrl,
    hideFeedback,
}: OverviewLayoutProps): ReactElement {
    return (
        <main className="fern-overview-layout">
            <aside className="fern-layout-toc">
                {tableOfContents != null && tableOfContents.length > 0 && (
                    <FernScrollArea className="px-4 pb-12 pt-8 lg:pr-8">
                        <TableOfContents tableOfContents={tableOfContents} />
                    </FernScrollArea>
                )}
            </aside>
            <article className="fern-layout-content max-w-content-wide-width">
                <PageHeader breadcrumbs={breadcrumbs} title={title} subtitle={subtitle} />
                <div className="fern-prose max-w-full">{children}</div>
                {(!hideFeedback || editThisPageUrl != null) && (
                    <footer className="mt-12">
                        <div className="flex gap-4 max-sm:flex-col sm:justify-between">
                            <div>{!hideFeedback && <Feedback />}</div>
                            <EditThisPageButton editThisPageUrl={editThisPageUrl} />
                        </div>
                        <BuiltWithFern className="mx-auto my-8 w-fit" />
                    </footer>
                )}
            </article>
        </main>
    );
}

export function toOverviewLayoutHastNode({ children, ...attributes }: OverviewLayoutOpts): MdxJsxFlowElementHast {
    return {
        type: "mdxJsxFlowElement",
        name: "OverviewLayout",
        attributes: Object.entries(attributes).map(([key, value]) => toAttribute(key, value)),
        children,
    };
}
