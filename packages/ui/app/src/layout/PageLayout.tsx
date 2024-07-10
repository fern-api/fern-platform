import type { ElementContent } from "hast";
import { MdxJsxFlowElementHast } from "mdast-util-mdx-jsx";
import { ReactElement, ReactNode } from "react";
import { EditThisPageButton } from "../components/EditThisPage";
import { PageHeader } from "../components/PageHeader";
import { Feedback } from "../custom-docs-page/Feedback";
import { toAttribute } from "../mdx/plugins/utils";
import { BuiltWithFern } from "../sidebar/BuiltWithFern";

interface PageLayoutProps {
    breadcrumbs: string[];
    title: string;
    subtitle: ReactNode | undefined;
    children: ReactNode;
    editThisPageUrl: string | undefined;
    hideFeedback: boolean | undefined;
    hideNavLinks: boolean | undefined;
}

interface PageLayoutOpts {
    breadcrumbs: string[];
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
