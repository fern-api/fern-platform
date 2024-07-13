import clsx from "clsx";
import type { ElementContent } from "hast";
import { MdxJsxFlowElementHast } from "mdast-util-mdx-jsx";
import { ReactElement, ReactNode, isValidElement } from "react";
import { EditThisPageButton } from "../../../components/EditThisPage";
import { PageHeader } from "../../../components/PageHeader";
import { useApiPageContext } from "../../../contexts/useApiPageContext";
import { Feedback } from "../../../custom-docs-page/Feedback";
import { BuiltWithFern } from "../../../sidebar/BuiltWithFern";
import { toAttribute } from "../../plugins/utils";

interface ReferenceLayoutProps {
    breadcrumbs: string[];
    title: string;
    subtitle: ReactNode | undefined;
    aside: ReactNode | undefined;
    children: ReactNode;
    editThisPageUrl: string | undefined;
    hideFeedback: boolean | undefined;
}

interface ReferenceLayoutOpts {
    breadcrumbs: string[];
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
                <article className="mx-auto w-full lg:ml-0 xl:mx-auto pb-20 max-w-content-width md:max-w-endpoint-width">
                    <PageHeader breadcrumbs={breadcrumbs} title={title} subtitle={subtitle} />
                    <section
                        className={clsx("max-w-full prose dark:prose-invert prose-h1:mt-[1.5em] first:prose-h1:mt-0", {
                            "md:grid md:grid-cols-2 md:gap-8 lg:gap-12 max-md:space-y-12": isValidElement(aside),
                        })}
                    >
                        <div className="fern-prose">{children}</div>
                        {isValidElement(aside) && (
                            <aside className="relative">
                                <div className="md:top-header-offset md:sticky md:py-8 md:-my-8 fern-prose">
                                    {aside}
                                </div>
                            </aside>
                        )}
                    </section>
                    {(!hideFeedback || editThisPageUrl != null) && (
                        <footer className="mt-12">
                            <div className="flex sm:justify-between max-sm:flex-col gap-4">
                                <div>{!hideFeedback && <Feedback />}</div>
                                <EditThisPageButton editThisPageUrl={editThisPageUrl} />
                            </div>
                            {!isApiPage && <BuiltWithFern className="w-fit mx-auto my-8" />}
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
