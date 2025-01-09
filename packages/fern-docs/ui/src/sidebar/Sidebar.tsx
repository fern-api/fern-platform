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

  return showDismissableSidebar ? (
    <DismissableSidebar className={className} />
  ) : (
    <SidebarContainer className={clsx("desktop", className)} />
  );
});
