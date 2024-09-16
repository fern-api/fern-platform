import type { FernNavigation } from "@fern-api/fdr-sdk";
import clsx from "clsx";
import type { ElementContent } from "hast";
import type { MdxJsxFlowElementHast } from "mdast-util-mdx-jsx";
import { isValidElement, type ReactElement, type ReactNode } from "react";
import { EditThisPageButton } from "../../../components/EditThisPage";
import { PageHeader } from "../../../components/PageHeader";
import { useApiPageContext } from "../../../contexts/api-page";
import { Feedback } from "../../../feedback/Feedback";
import { BuiltWithFern } from "../../../sidebar/BuiltWithFern";
import { toAttribute } from "../../plugins/utils";

interface ReferenceLayoutProps {
    breadcrumbs: readonly FernNavigation.NavigationBreadcrumbItem[];

    title: string;
    subtitle: ReactNode | undefined;
    aside: ReactNode | undefined;
    children: ReactNode;
    editThisPageUrl: string | undefined;
    hideFeedback: boolean | undefined;
}

interface ReferenceLayoutOpts {
    breadcrumbs: readonly FernNavigation.NavigationBreadcrumbItem[];

    title: string;
    subtitle: ElementContent | undefined;
    aside: ElementContent | undefined;
    children: ElementContent[];
    editThisPageUrl: string | undefined;
    hideFeedback: boolean | undefined;
}

export function ReferenceLayout({
    breadcrumbs,
    title,
    subtitle,
    aside,
    children,
    editThisPageUrl,
    hideFeedback,
}: ReferenceLayoutProps): ReactElement {
    const isApiPage = useApiPageContext();
    return (
        <main className="fern-reference-layout">
            <div className="z-10 w-full min-w-0 pt-8">
                <article className="max-w-content-width md:max-w-endpoint-width mx-auto w-full pb-20 lg:ml-0 xl:mx-auto">
                    <PageHeader breadcrumbs={breadcrumbs} title={title} subtitle={subtitle} />
                    <div
                        className={clsx("prose dark:prose-invert prose-h1:mt-[1.5em] first:prose-h1:mt-0 max-w-full", {
                            "max-md:space-y-12 md:grid md:grid-cols-2 md:gap-8 lg:gap-12": isValidElement(aside),
                        })}
                    >
                        <div className="fern-prose">{children}</div>
                        {isValidElement(aside) && (
                            <aside className="relative">
                                <div className="md:top-header-offset fern-prose md:sticky md:-my-8 md:py-8">
                                    {aside}
                                </div>
                            </aside>
                        )}
                    </div>
                    {(!hideFeedback || editThisPageUrl != null) && (
                        <footer className="mt-12">
                            <div className="flex gap-4 max-sm:flex-col sm:justify-between">
                                <div>{!hideFeedback && <Feedback />}</div>
                                <EditThisPageButton editThisPageUrl={editThisPageUrl} />
                            </div>
                            {!isApiPage && <BuiltWithFern className="mx-auto my-8 w-fit" />}
                        </footer>
                    )}
                </article>
            </div>
        </main>
    );
}

export function toReferenceLayoutHastNode({ children, ...attributes }: ReferenceLayoutOpts): MdxJsxFlowElementHast {
    return {
        type: "mdxJsxFlowElement",
        name: "ReferenceLayout",
        attributes: Object.entries(attributes).map(([key, value]) => toAttribute(key, value)),
        children,
    };
}
