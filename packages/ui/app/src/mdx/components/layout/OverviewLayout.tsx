import type * as FernNavigation from "@fern-api/fdr-sdk/navigation";
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
    breadcrumb: readonly FernNavigation.BreadcrumbItem[];
    title: string;
    subtitle: ReactNode | undefined;
    tableOfContents: TableOfContentsItem[] | undefined;
    children: ReactNode;
    editThisPageUrl: string | undefined;
    hideFeedback: boolean | undefined;
}

interface OverviewLayoutOpts {
    breadcrumb: readonly FernNavigation.BreadcrumbItem[];
    title: string;
    subtitle: ElementContent | undefined;
    tableOfContents: TableOfContentsItem[] | undefined;
    children: ElementContent[];
    editThisPageUrl: string | undefined;
    hideFeedback: boolean | undefined;
}

export function OverviewLayout({
    breadcrumb,
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
                <PageHeader breadcrumb={breadcrumb} title={title} subtitle={subtitle} />
                <div className="max-w-full fern-prose">{children}</div>
                {(!hideFeedback || editThisPageUrl != null) && (
                    <footer className="mt-12">
                        <div className="flex sm:justify-between max-sm:flex-col gap-4">
                            <div>{!hideFeedback && <Feedback />}</div>
                            <EditThisPageButton editThisPageUrl={editThisPageUrl} />
                        </div>
                        <BuiltWithFern className="w-fit mx-auto my-8" />
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
