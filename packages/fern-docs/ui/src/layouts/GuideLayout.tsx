import type { FC, ReactElement, ReactNode } from "react";
import { BottomNavigationNeighbors } from "../components/BottomNavigationNeighbors";
import { EditThisPageButton } from "../components/EditThisPage";
import { Feedback } from "../feedback/Feedback";
import { BuiltWithFern } from "../sidebar/BuiltWithFern";

interface GuideLayoutProps {
  PageHeader: FC;
  TableOfContents: FC;
  children: ReactNode;
  hideTableOfContents: boolean | undefined;
  editThisPageUrl: string | undefined;
  hideFeedback: boolean | undefined;
  hideNavLinks: boolean | undefined;
}

export function GuideLayout({
  PageHeader,
  TableOfContents,
  children,
  hideTableOfContents,
  editThisPageUrl,
  hideFeedback,
  hideNavLinks,
}: GuideLayoutProps): ReactElement {
  return (
    <main className="fern-guide-layout">
      {!hideTableOfContents && <TableOfContents />}
      <article className="fern-layout-content max-w-content-width">
        <PageHeader />
        <div className="prose dark:prose-invert prose-h1:mt-[1.5em] first:prose-h1:mt-0 max-w-full break-words">
          {children}
        </div>
        {(!hideFeedback || !hideNavLinks || editThisPageUrl != null) && (
          <footer className="mt-12">
            <div className="flex gap-4 max-sm:flex-col sm:justify-between">
              <div>{!hideFeedback && <Feedback />}</div>
              <EditThisPageButton editThisPageUrl={editThisPageUrl} />
            </div>

            {!hideNavLinks && <BottomNavigationNeighbors />}
          </footer>
        )}
        <BuiltWithFern className="mx-auto my-8 w-fit" />
      </article>
    </main>
  );
}
