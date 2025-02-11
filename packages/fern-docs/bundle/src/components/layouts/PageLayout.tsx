import React from "react";

import { BuiltWithFern } from "@/components/built-with-fern";
import { EditThisPageButton } from "@/components/components/EditThisPage";
import { Feedback } from "@/components/feedback/Feedback";

interface PageLayoutProps {
  header: React.ReactNode;
  children: React.ReactNode;
  editThisPageUrl: string | undefined;
  hideFeedback: boolean | undefined;
  hideNavLinks: boolean | undefined;
}

export function PageLayout({
  header,
  children,
  editThisPageUrl,
  hideFeedback,
}: PageLayoutProps) {
  return (
    <main className="fern-page-layout">
      {header}
      <div className="prose dark:prose-invert prose-h1:mt-[1.5em] first:prose-h1:mt-0 max-w-full break-words">
        {children}
      </div>
      {(!hideFeedback || editThisPageUrl != null) && (
        <footer className="mt-12">
          <div className="flex gap-4 max-sm:flex-col sm:justify-between">
            <div>{!hideFeedback && <Feedback />}</div>
            <EditThisPageButton editThisPageUrl={editThisPageUrl} />
          </div>
        </footer>
      )}
      <BuiltWithFern className="mx-auto my-8 w-fit" />
    </main>
  );
}
