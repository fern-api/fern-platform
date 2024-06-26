import { ReactElement, ReactNode } from "react";
import { EditThisPageButton } from "../markdown-page/EditThisPageButton";
import { Feedback } from "../markdown-page/Feedback";
import { MarkdownHeader } from "../markdown-page/MarkdownHeader";
import { TableOfContentsItem } from "../markdown-page/TableOfContents";

interface PageLayoutProps {
    breadcrumbs: string[];
    title: string;
    subtitle: ReactNode | undefined;
    tableOfContents: TableOfContentsItem[] | undefined;
    children: ReactNode;
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
        <article className="relative px-4 md:px-6 lg:pl-8 lg:pr-16 xl:pr-0">
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
    );
}
