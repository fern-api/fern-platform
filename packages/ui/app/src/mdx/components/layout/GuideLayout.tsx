import { FernScrollArea } from "@fern-ui/components";
import type { ElementContent } from "hast";
import type { MdxJsxFlowElementHast } from "mdast-util-mdx-jsx";
import { ReactNode, type ReactElement } from "react";
import { BottomNavigationButtons } from "../../../components/BottomNavigationButtons";
import { EditThisPageButton } from "../../../components/EditThisPage";
import { PageHeader } from "../../../components/PageHeader";
import { TableOfContents, TableOfContentsItem } from "../../../components/TableOfContents";
import { Feedback } from "../../../feedback/Feedback";
import { BuiltWithFern } from "../../../sidebar/BuiltWithFern";
import { toAttribute } from "../../plugins/utils";

interface GuideLayoutProps {
    breadcrumbs: string[];
    title: string;
    subtitle: ReactNode | undefined;
    tableOfContents: TableOfContentsItem[] | undefined;
    children: ReactNode;
    editThisPageUrl: string | undefined;
    hideFeedback: boolean | undefined;
    hideNavLinks: boolean | undefined;
}

interface GuideLayoutOpts {
    breadcrumbs: string[];
    title: string;
    subtitle: ElementContent | undefined;
    tableOfContents: TableOfContentsItem[] | undefined;
    children: ElementContent[];
    editThisPageUrl: string | undefined;
    hideFeedback: boolean | undefined;
    hideNavLinks: boolean | undefined;
}

export function GuideLayout({
    breadcrumbs,
    title,
    tableOfContents,
    subtitle,
    children,
    editThisPageUrl,
    hideFeedback,
    hideNavLinks,
}: GuideLayoutProps): ReactElement {
    return (
        <main className="fern-guide-layout">
            <aside className="fern-layout-toc">
                {tableOfContents != null && tableOfContents.length > 0 && (
                    <FernScrollArea className="px-4 pb-12 pt-8 lg:pr-8">
                        <TableOfContents tableOfContents={tableOfContents} />
                    </FernScrollArea>
                )}
            </aside>
            <article className="fern-layout-content max-w-content-width">
                <PageHeader breadcrumbs={breadcrumbs} title={title} subtitle={subtitle} />
                <div className="max-w-full fern-prose">{children}</div>
                {(!hideFeedback || !hideNavLinks || editThisPageUrl != null) && (
                    <footer className="mt-12">
                        <div className="flex sm:justify-between max-sm:flex-col gap-4">
                            <div>{!hideFeedback && <Feedback />}</div>
                            <EditThisPageButton editThisPageUrl={editThisPageUrl} />
                        </div>

                        {!hideNavLinks && <BottomNavigationButtons />}
                        <BuiltWithFern className="w-fit mx-auto my-8" />
                    </footer>
                )}
            </article>
        </main>
    );
}

export function toGuideLayoutHastNode({ children, ...attributes }: GuideLayoutOpts): MdxJsxFlowElementHast {
    return {
        type: "mdxJsxFlowElement",
        name: "GuideLayout",
        attributes: Object.entries(attributes).map(([key, value]) => toAttribute(key, value)),
        children,
    };
}
