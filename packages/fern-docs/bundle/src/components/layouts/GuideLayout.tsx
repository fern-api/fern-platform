import type { ReactElement } from "react";

import { BuiltWithFern } from "@/components/built-with-fern";

import { BottomNavigationNeighbors } from "../components/BottomNavigationNeighbors";
import { EditThisPageButton } from "../components/EditThisPage";
import { Feedback } from "../feedback/Feedback";

interface GuideLayoutProps {
  header: React.ReactNode;
  toc: React.ReactNode;
  children: React.ReactNode;
  editThisPageUrl: string | undefined;
  hideFeedback: boolean | undefined;
  hideNavLinks: boolean | undefined;
}

export function GuideLayout({
  header,
  toc,
  children,
  editThisPageUrl,
  hideFeedback,
  hideNavLinks,
}: GuideLayoutProps): ReactElement<any> {
  return (
    <main className="fern-guide-layout">
      {toc}
      <article className="fern-layout-content max-w-content-width">
        {header}
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
