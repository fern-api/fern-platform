import { FC, type ReactElement, type ReactNode } from "react";
import { EditThisPageButton } from "../components/EditThisPage";
import { WithAside } from "../contexts/api-page";
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
  return (
    <main className="fern-reference-layout">
      <div className="z-10 w-full min-w-0 pt-8">
        <article className="max-w-content-width md:max-w-endpoint-width mx-auto w-full pb-20 lg:ml-0 xl:mx-auto">
          <PageHeader />
          {hasAside ? (
            <WithAside.Provider value={true}>
              <div className="grid max-w-full gap-8 md:grid-cols-2 lg:gap-12">
                {children}
              </div>
            </WithAside.Provider>
          ) : (
            <div className="prose dark:prose-invert prose-h1:mt-[1.5em] first:prose-h1:mt-0 max-w-full break-words">
              {children}
            </div>
          )}
          {(!hideFeedback || editThisPageUrl != null) && (
            <footer className="mt-12">
              <div className="flex gap-4 max-sm:flex-col sm:justify-between">
                <div>{!hideFeedback && <Feedback />}</div>
                <EditThisPageButton editThisPageUrl={editThisPageUrl} />
              </div>
            </footer>
          )}
          <BuiltWithFern className="mx-auto my-8 w-fit" />
        </article>
      </div>
    </main>
  );
}
