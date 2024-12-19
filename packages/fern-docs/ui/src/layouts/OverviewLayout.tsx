import { FC, ReactElement, ReactNode } from "react";
import { EditThisPageButton } from "../components/EditThisPage";
import { Feedback } from "../feedback/Feedback";
import { BuiltWithFern } from "../sidebar/BuiltWithFern";

interface OverviewLayoutProps {
  PageHeader: FC;
  TableOfContents: FC;
  children: ReactNode;
  editThisPageUrl: string | undefined;
  hideFeedback: boolean | undefined;
}

export function OverviewLayout({
  PageHeader,
  TableOfContents,
  children,
  editThisPageUrl,
  hideFeedback,
}: OverviewLayoutProps): ReactElement {
  return (
    <main className="fern-overview-layout">
      <TableOfContents />
      <article className="fern-layout-content max-w-content-wide-width">
        <PageHeader />
        <div className="max-w-full prose dark:prose-invert prose-h1:mt-[1.5em] first:prose-h1:mt-0 break-words">
          {children}
        </div>
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
      </article>
    </main>
  );
}
