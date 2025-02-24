import { BuiltWithFern } from "../built-with-fern";
import { EditThisPageButton } from "../components/EditThisPage";
import { Feedback } from "../feedback/Feedback";

export function FooterLayout({
  hideFeedback,
  hideNavLinks,
  editThisPageUrl,
  bottomNavigation,
  pathname,
}: {
  hideFeedback?: boolean;
  hideNavLinks?: boolean;
  editThisPageUrl?: string;
  bottomNavigation?: React.ReactNode;
  pathname?: string;
}) {
  return (
    <footer className="mt-12 space-y-8">
      <div className="flex gap-4 max-sm:flex-col sm:justify-between">
        <div>{!hideFeedback && <Feedback pathname={pathname} />}</div>
        <EditThisPageButton editThisPageUrl={editThisPageUrl} />
      </div>

      {!hideNavLinks && bottomNavigation}

      <BuiltWithFern className="mx-auto w-fit" />
    </footer>
  );
}
