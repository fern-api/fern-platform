import { FC, type ReactElement, type ReactNode } from "react";
import { EditThisPageButton } from "../components/EditThisPage";
import { useApiPageContext } from "../contexts/api-page";
import { Feedback } from "../feedback/Feedback";
import { BuiltWithFern } from "../sidebar/BuiltWithFern";

interface ReferenceLayoutProps {
    PageHeader: FC;
    children: ReactNode;
    editThisPageUrl: string | undefined;
    hideFeedback: boolean | undefined;

    /**
     * hasAside is true if the page has an <Aside> tag, which changes how the layout is rendered:
     *  - the content is rendered in a 2-column layout on desktop, while the aside is rendered above the main content on mobile
     *  - the content and aside are rendered by the ReferenceLayoutMain and ReferenceLayoutAside components, respectively
     *  - those components are created using the rehypeExtractAsides plugin, and is responsible for `prose` classes
     */
    hasAside: boolean;
}

export function ReferenceLayout({
    PageHeader,
    children,
    editThisPageUrl,
    hideFeedback,
    hasAside,
}: ReferenceLayoutProps): ReactElement {
    const isApiPage = useApiPageContext();

    return (
        <main className="fern-reference-layout">
            <div className="z-10 w-full min-w-0 pt-8">
                <article className="mx-auto w-full lg:ml-0 xl:mx-auto pb-20 max-w-content-width md:max-w-endpoint-width">
                    <PageHeader />
                    {hasAside ? (
                        <div className="max-w-full grid gap-8 lg:gap-12 md:grid-cols-2">{children}</div>
                    ) : (
                        <div className="max-w-full prose dark:prose-invert prose-h1:mt-[1.5em] first:prose-h1:mt-0 break-words">
                            {children}
                        </div>
                    )}
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
