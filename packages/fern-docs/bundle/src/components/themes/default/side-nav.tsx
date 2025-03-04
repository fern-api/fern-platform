"use client";

import { cn } from "@fern-docs/components";
import { useIsDesktop } from "@fern-ui/react-commons";

import { BgImageGradient } from "@/components/BgImageGradient";
import { HideAsides, useIsSidebarFixed } from "@/state/layout";

import { MobileMenu } from "./mobile-menu";

export function SidebarNav({
  children,
  hasSidebarBackgroundColor,
}: {
  children: React.ReactNode;
  hasSidebarBackgroundColor?: boolean;
}) {
  const isDesktop = useIsDesktop();

  if (!isDesktop) {
    return (
      <MobileMenu hasSidebarBackgroundColor={hasSidebarBackgroundColor}>
        {children}
      </MobileMenu>
    );
  }

  return (
    <DesktopMenu hasSidebarBackgroundColor={hasSidebarBackgroundColor}>
      {children}
    </DesktopMenu>
  );
}

function DesktopMenu({
  children,
  hasSidebarBackgroundColor,
}: {
  children: React.ReactNode;
  hasSidebarBackgroundColor?: boolean;
}) {
  const fixed = useIsSidebarFixed();
  return (
    <>
      <HideAsides />
      <aside
        id="fern-sidebar"
        data-state={fixed ? "fixed" : "sticky"}
        className={cn(
          "pointer-events-auto",
          "z-30",
          "lg:flex lg:shrink-0 lg:translate-x-0 lg:flex-col",
          "pl-(--aside-offset) w-(--sticky-aside-width)",
          !fixed &&
            "sticky h-fit max-h-[calc(100dvh-var(--header-height))] shrink-0 border-r-0",
          fixed &&
            "border-border-concealed fixed bottom-0 left-0 border-r backdrop-blur-xl",
          "top-(--header-height) hidden",
          { "bg-(color:--sidebar-background)": hasSidebarBackgroundColor }
        )}
      >
        {fixed && !hasSidebarBackgroundColor && (
          <div className="clipped-background opacity-70">
            <BgImageGradient className="translate-y-[calc(var(--header-height)*-1)]" />
          </div>
        )}
        {children}
      </aside>
      {fixed && (
        <aside
          id="fern-sidebar-spacer"
          className="w-(--sticky-aside-width) pointer-events-none hidden lg:block lg:shrink-0"
        />
      )}
    </>
  );
}
