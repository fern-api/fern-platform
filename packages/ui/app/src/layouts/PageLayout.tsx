import { FC, ReactElement, ReactNode } from "react";
import { EditThisPageButton } from "../components/EditThisPage";
import { Feedback } from "../feedback/Feedback";
import { BuiltWithFern } from "../sidebar/BuiltWithFern";

interface PageLayoutProps {
    PageHeader: FC;
    children: ReactNode;
    editThisPageUrl: string | undefined;
    hideFeedback: boolean | undefined;
    hideNavLinks: boolean | undefined;
}

export function PageLayout({ PageHeader, children, editThisPageUrl, hideFeedback }: PageLayoutProps): ReactElement {
    return (
        <main className="fern-page-layout">
            <PageHeader />
            <div className="max-w-full prose dark:prose-invert prose-h1:mt-[1.5em] first:prose-h1:mt-0 break-words">
                {children}
            </div>
            <h1>&quot;yoyoyoyo&quot;</h1>
            {(!hideFeedback || editThisPageUrl != null) && (
                <footer className="mt-12">
                    <div className="flex sm:justify-between max-sm:flex-col gap-4">
                        <div>{!hideFeedback && <Feedback />}</div>
                        <EditThisPageButton editThisPageUrl={editThisPageUrl} />
                    </div>
                    <div className="w-fit mx-auto my-8">
                        <BuiltWithFern />
                    </div>
                </footer>
            )}
        </main>
    );
}
