import { cn } from "@fern-docs/components";

import { EditThisPageButton } from "../EditThisPage";
import { BuiltWithFern } from "../built-with-fern";
import { Feedback } from "../feedback/Feedback";

export function FooterLayout({
  hideFeedback,
  hideNavLinks,
  editThisPageUrl,
  bottomNavigation,
  pathname,
  className,
}: {
  hideFeedback?: boolean;
  hideNavLinks?: boolean;
  editThisPageUrl?: string;
  bottomNavigation?: React.ReactNode;
  pathname?: string;
  className?: string;
}) {
  return (
    <footer className={cn("fern-layout-footer not-prose", className)}>
      <div className="fern-layout-footer-toolbar">
        <div>{!hideFeedback && <Feedback pathname={pathname} />}</div>
        <EditThisPageButton editThisPageUrl={editThisPageUrl} />
      </div>

      {!hideNavLinks && bottomNavigation}

      <BuiltWithFern className="mx-auto mt-12 w-fit" />
    </footer>
  );
}
