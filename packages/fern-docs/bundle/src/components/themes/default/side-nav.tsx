"use client";

import { cn } from "@fern-docs/components";
import { useIsDesktop } from "@fern-ui/react-commons";

import {
  FERN_SIDEBAR_ID,
  FERN_SIDEBAR_SPACER_ID,
} from "@/components/constants";
import {
  HideAsides,
  useIsHeaderDisabled,
  useIsSidebarFixed,
  useLayout,
} from "@/state/layout";

import { DismissableMenu } from "./dismissable-menu";

export function SidebarNav({
  children,
  className,
  mobileClassName,
  desktopClassName,
  ...props
}: {
  children: React.ReactNode;
  className?: string;
  mobileClassName?: string;
  desktopClassName?: string;
  "data-theme"?: string;
}) {
  const isDesktop = useIsDesktop();
  const layout = useLayout();
  const isHeaderDisabled = useIsHeaderDisabled();

  if (
    !isDesktop ||
    // side effect: if the header is disabled, the sidebar will always be fixed and visible (never dismissable) in desktop mode
    // otherwise, the sidebar is unmounted only for the page and custom layouts
    (!isHeaderDisabled && (layout === "page" || layout === "custom"))
  ) {
    return (
      <DismissableMenu
        className={cn(className, mobileClassName)}
        {...props}
        side={isDesktop ? "left" : "right"}
      >
        {children}
      </DismissableMenu>
    );
  }

  return (
    <DesktopMenu className={cn(className, desktopClassName)} {...props}>
      {children}
    </DesktopMenu>
  );
}

function DesktopMenu({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const fixed = useIsSidebarFixed();
  return (
    <>
      <HideAsides />
      <aside
        id={FERN_SIDEBAR_ID}
        data-viewport="desktop"
        data-state={fixed ? "fixed" : "sticky"}
        className={className}
      >
        {children}
      </aside>
      {fixed && <aside id={FERN_SIDEBAR_SPACER_ID} />}
    </>
  );
}
