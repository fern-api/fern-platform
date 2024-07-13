import { FernScrollArea } from "@fern-ui/components";
import type { ElementContent } from "hast";
import { useAtomValue } from "jotai";
import { MdxJsxFlowElementHast } from "mdast-util-mdx-jsx";
import { ReactElement, ReactNode } from "react";
import { CONTENT_WIDTH_PX_ATOM } from "../atoms/layout";
import { EditThisPageButton } from "../components/EditThisPage";
import { PageHeader } from "../components/PageHeader";
import { TableOfContents, TableOfContentsItem } from "../components/TableOfContents";
import { Feedback } from "../custom-docs-page/Feedback";
import { toAttribute } from "../mdx/plugins/utils";
import { BuiltWithFern } from "../sidebar/BuiltWithFern";
import { ContentWidthProvider } from "./ContentWidthContext";

interface OverviewLayoutProps {
    breadcrumbs: string[];
    title: string;
    subtitle: ReactNode | undefined;
    tableOfContents: TableOfContentsItem[] | undefined;
    children: ReactNode;
    editThisPageUrl: string | undefined;
    hideFeedback: boolean | undefined;
}

interface OverviewLayoutOpts {
    breadcrumbs: string[];
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
    const contentWidth = useAtomValue(CONTENT_WIDTH_PX_ATOM);
    return (
        <ContentWidthProvider width={contentWidth * 1.5 + 8}>
            <main className="fern-overview-layout">
                <aside className="fern-layout-toc">
                    {tableOfContents != null && tableOfContents.length > 0 && (
                        <FernScrollArea className="px-4 pb-12 pt-8 lg:pr-8">
                            <TableOfContents tableOfContents={tableOfContents} />
                        </FernScrollArea>
                    )}
                </aside>
                <article className="fern-layout-content">
                    <div className="max-w-content-wide-width w-full">
                        <PageHeader breadcrumbs={breadcrumbs} title={title} subtitle={subtitle} />
                        <section className="max-w-full fern-prose">{children}</section>
                        {(!hideFeedback || editThisPageUrl != null) && (
                            <footer className="mt-12">
                                <div className="flex sm:justify-between max-sm:flex-col gap-4">
                                    <div>{!hideFeedback && <Feedback />}</div>
                                    <EditThisPageButton editThisPageUrl={editThisPageUrl} />
                                </div>
                                <BuiltWithFern className="w-fit mx-auto my-8" />
                            </footer>
                        )}
                    </div>
                </article>
            </main>
        </ContentWidthProvider>
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
