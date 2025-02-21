"use client";

import { usePathname } from "next/navigation";
import React from "react";

import {
  Dialog,
  DialogContent,
  DialogOverlay,
  DialogPortal,
} from "@radix-ui/react-dialog";

import { cn } from "@fern-docs/components";
import { useIsMobile } from "@fern-ui/react-commons";
import { useIsDesktop } from "@fern-ui/react-commons/src/useBreakpoint";

import { HeaderTabsRoot } from "@/components/header/HeaderTabsRoot";
import { useShouldHideAsides } from "@/state/layout";
import {
  useCloseDismissableSidebar,
  useIsDismissableSidebarOpen,
} from "@/state/mobile";

import { FernHeader } from "./fern-header";

export default function DefaultDocs({
  header,
  sidebar,
  children,
  announcement,
  tabs,
  sidebarFixed = false,
}: {
  header: React.ReactNode;
  sidebar: React.ReactNode;
  children: React.ReactNode;
  announcement?: React.ReactNode;
  tabs?: React.ReactNode;
  sidebarFixed?: boolean;
}) {
  const hideAsides = useShouldHideAsides();
  return (
    <div className="relative h-[100dvh]" id="fern-docs-wrapper">
      <FernHeader className="bg-header-background border-border-concealed fixed inset-x-0 top-0 z-30 border-b backdrop-blur-lg">
        {announcement}
        <div className="h-header-height-real px-page-padding flex items-center">
          {header}
        </div>
        <HeaderTabsRoot>{tabs}</HeaderTabsRoot>
      </FernHeader>

      <main className="mt-(--header-height) relative z-0">
        <div
          className={cn("max-w-page-width-padded mx-auto flex flex-row", {
            "[&>aside]:lg:hidden": hideAsides,
          })}
        >
          <SideNav fixed={sidebarFixed}>{sidebar}</SideNav>
          {children}
        </div>
      </main>

      {/* Enables footer DOM injection */}
      <footer id="fern-footer" />
    </div>
  );
}

function SideNav({
  children,
  fixed = false,
}: {
  children: React.ReactNode;
  fixed?: boolean;
}) {
  const isDesktop = useIsDesktop();
  const isDismissableSidebarOpen = useIsDismissableSidebarOpen();
  const closeDismissableSidebar = useCloseDismissableSidebar();
  const currentPath = usePathname();
  React.useEffect(() => {
    closeDismissableSidebar();
  }, [currentPath]);

  return (
    <>
      {isDesktop && (
        <aside
          className={cn(
            "pointer-events-auto",
            "z-30",
            "lg:flex lg:shrink-0 lg:translate-x-0 lg:flex-col lg:opacity-100 lg:transition-none",
            !fixed &&
              "lg:sticky lg:h-fit lg:max-h-[calc(100dvh-var(--header-height))] lg:border-r-0",
            fixed && "lg:border-border-concealed",
            "sm:ease-shift data-[mobile-state=closed]:!transition-none sm:-translate-x-full sm:opacity-0 sm:transition-[transform,opacity] sm:duration-150 sm:will-change-auto sm:data-[mobile-state=open]:translate-x-0 sm:data-[mobile-state=open]:opacity-100",
            "sm:border-border-default sm:w-(--spacing-sidebar-width) sm:flex sm:border-r",
            "bg-background/70 fixed inset-0 hidden w-dvw backdrop-blur-xl data-[mobile-state=open]:flex",
            "top-(--header-height)"
          )}
          data-mobile-state={isDismissableSidebarOpen ? "open" : "closed"}
        >
          {children}
        </aside>
      )}
      {isDesktop && fixed && (
        <aside className="lg:w-(--spacing-sidebar-width) pointer-events-none hidden lg:block lg:shrink-0" />
      )}
      {!isDesktop && <MobileSideNav>{children}</MobileSideNav>}
    </>
  );
}

function MobileSideNav({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useIsDismissableSidebarOpen();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogPortal>
        <DialogOverlay className="bg-background/70 fixed inset-0 z-40" />
        <DialogContent
          className={cn(
            "sm:w-sidebar-width bg-background/70 border-border-concealed fixed inset-y-0 right-0 z-50 w-full max-w-[calc(100dvw-3rem)] transform border-l backdrop-blur-xl",
            "transition-transform duration-300 data-[state=closed]:translate-x-full data-[state=open]:translate-x-0"
          )}
        >
          {children}
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}
