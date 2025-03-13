"use client";

import { cn } from "@fern-docs/components";
import { useIsDesktop } from "@fern-ui/react-commons";

import { HideAsides, useIsSidebarFixed } from "@/state/layout";

import { MobileMenu } from "./mobile-menu";

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

  if (!isDesktop) {
    return (
      <MobileMenu className={cn(className, mobileClassName)} {...props}>
        {children}
      </MobileMenu>
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
        id="fern-sidebar"
        data-viewport="desktop"
        data-state={fixed ? "fixed" : "sticky"}
        className={className}
      >
        {children}
      </aside>
      {fixed && <aside id="fern-sidebar-spacer" />}
    </>
  );
}
