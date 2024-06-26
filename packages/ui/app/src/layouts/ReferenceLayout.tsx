import { ReactElement, ReactNode } from "react";
import { EditThisPageButton } from "../markdown-page/EditThisPageButton";
import { Feedback } from "../markdown-page/Feedback";
import { MarkdownHeader } from "../markdown-page/MarkdownHeader";
import { TableOfContentsItem } from "../markdown-page/TableOfContents";

interface ReferenceLayoutProps {
    breadcrumbs: string[];
    title: string;
    subtitle: ReactNode | undefined;
    tableOfContents: TableOfContentsItem[] | undefined;
    children: ReactNode;
    editThisPageUrl: string | undefined;
    hideFeedback: boolean | undefined;
}

export function ReferenceLayout({
    breadcrumbs,
    title,
    subtitle,
    children,
    editThisPageUrl,
    hideFeedback,
}: ReferenceLayoutProps): ReactElement {
    return (
        <div className="relative flex flex-row-reverse justify-between px-4 md:px-6 lg:pl-8 lg:pr-16 xl:pr-0">
            <div className="z-10 w-full min-w-0 pt-8 lg:pr-8">
                <article className="mx-auto w-full break-words lg:ml-0 xl:mx-auto pb-20 max-w-content-width md:max-w-endpoint-width">
                    <MarkdownHeader breadcrumbs={breadcrumbs} title={title} subtitle={subtitle} />
                    <section className="max-w-full">{children}</section>
                    {(!hideFeedback || editThisPageUrl != null) && (
                        <footer className="mt-12 not-prose">
                            <div className="flex sm:justify-between max-sm:flex-col gap-4">
                                <div>{!hideFeedback && <Feedback />}</div>
                                <EditThisPageButton editThisPageUrl={editThisPageUrl} />
                            </div>
                        </footer>
                    )}
                </article>
            </div>
        </div>
    );
}
