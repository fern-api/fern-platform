import type { FernNavigation } from "@fern-api/fdr-sdk";
import type { ElementContent } from "hast";
import type { MdxJsxFlowElementHast } from "mdast-util-mdx-jsx";
import { ReactElement, ReactNode } from "react";
import { EditThisPageButton } from "../../../components/EditThisPage";
import { PageHeader } from "../../../components/PageHeader";
import { Feedback } from "../../../feedback/Feedback";
import { BuiltWithFern } from "../../../sidebar/BuiltWithFern";
import { toAttribute } from "../../plugins/utils";

interface PageLayoutProps {
    breadcrumbs: readonly FernNavigation.NavigationBreadcrumbItem[];
    title: string;
    subtitle: ReactNode | undefined;
    children: ReactNode;
    editThisPageUrl: string | undefined;
    hideFeedback: boolean | undefined;
    hideNavLinks: boolean | undefined;
}

interface PageLayoutOpts {
    breadcrumbs: readonly FernNavigation.NavigationBreadcrumbItem[];
    title: string;
    subtitle: ElementContent | undefined;
    children: ElementContent[];
    editThisPageUrl: string | undefined;
    hideFeedback: boolean | undefined;
    hideNavLinks: boolean | undefined;
}

export function PageLayout({
    breadcrumbs,
    title,
    subtitle,
    children,
    editThisPageUrl,
    hideFeedback,
}: PageLayoutProps): ReactElement {
    return (
        <main className="fern-page-layout">
            <PageHeader breadcrumbs={breadcrumbs} title={title} subtitle={subtitle} />
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
        </main>
    );
}

export function toPageLayoutHastNode({ children, ...attributes }: PageLayoutOpts): MdxJsxFlowElementHast {
    return {
        type: "mdxJsxFlowElement",
        name: "PageLayout",
        attributes: Object.entries(attributes).map(([key, value]) => toAttribute(key, value)),
        children,
    };
}
