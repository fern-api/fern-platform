import { cn } from "@fern-docs/components";

import { BuiltWithFern } from "../built-with-fern";
import { EditThisPageButton } from "../components/EditThisPage";
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
    <footer
      className={cn(
        "w-content-width mx-auto my-12 max-w-full space-y-8",
        className
      )}
    >
      <div className="flex gap-4 max-sm:flex-col sm:justify-between">
        <div>{!hideFeedback && <Feedback pathname={pathname} />}</div>
        <EditThisPageButton editThisPageUrl={editThisPageUrl} />
      </div>

      {!hideNavLinks && bottomNavigation}

      <BuiltWithFern className="mx-auto mt-12 w-fit" />
    </footer>
  );
}
