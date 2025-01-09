import clsx from "clsx";
import { useAtomValue } from "jotai";
import { ReactElement, memo } from "react";
import { DISABLE_SIDEBAR_ATOM, SIDEBAR_DISMISSABLE_ATOM } from "../atoms";
import { DismissableSidebar } from "./DismissableSidebar";
import { SidebarContainer } from "./SidebarContainer";

export const Sidebar = memo(function Sidebar({
  className,
}: {
  className?: string;
}): ReactElement | null {
  const showDismissableSidebar = useAtomValue(SIDEBAR_DISMISSABLE_ATOM);
  const disableSidebar = useAtomValue(DISABLE_SIDEBAR_ATOM);

  if (disableSidebar) {
    return null;
  }

  // TODO: if the <SearchBar /> component is used in a page, don't render the searchbar in the header

  return showDismissableSidebar ? (
    <DismissableSidebar className={className} />
  ) : (
    <SidebarContainer className={clsx("desktop", className)} />
  );
});
