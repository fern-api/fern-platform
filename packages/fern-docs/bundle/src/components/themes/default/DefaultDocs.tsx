"use client";

import { usePathname } from "next/navigation";
import React from "react";

import {
  Dialog,
  DialogContent,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from "@radix-ui/react-dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { motion, useDragControls } from "motion/react";

import { cn } from "@fern-docs/components";
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
  isSidebarFixed = false,
  isHeaderDisabled = false,
}: {
  header: React.ReactNode;
  sidebar: React.ReactNode;
  children: React.ReactNode;
  announcement?: React.ReactNode;
  tabs?: React.ReactNode;
  isSidebarFixed?: boolean;
  isHeaderDisabled?: boolean;
}) {
  const hideAsides = useShouldHideAsides();
  return (
    <>
      <FernHeader
        className={cn(
          "bg-header-background border-border-concealed fixed inset-x-0 top-0 z-30 border-b backdrop-blur-lg",
          { "lg:hidden": isHeaderDisabled }
        )}
      >
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
          <SideNav fixed={isSidebarFixed}>{sidebar}</SideNav>
          {children}
        </div>
      </main>

      {/* Enables footer DOM injection */}
      <footer id="fern-footer" />
    </>
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPath]);

  return (
    <>
      {isDesktop && (
        <aside
          className={cn(
            "pointer-events-auto",
            "z-30",
            "lg:flex lg:shrink-0 lg:translate-x-0 lg:flex-col",
            !fixed &&
              "sticky h-fit max-h-[calc(100dvh-var(--header-height))] border-r-0",
            fixed &&
              "border-border-concealed bg-background/70 fixed bottom-0 left-0 border-r backdrop-blur-xl",
            "w-(--spacing-sidebar-width)",
            "top-(--header-height) hidden"
          )}
          data-mobile-state={isDismissableSidebarOpen ? "open" : "closed"}
        >
          {children}
        </aside>
      )}
      {isDesktop && fixed && (
        <aside className="lg:w-(--spacing-sidebar-width) pointer-events-none hidden lg:block lg:shrink-0" />
      )}
      {!isDesktop && <MobileMenu>{children}</MobileMenu>}
    </>
  );
}

function MobileMenu({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useIsDismissableSidebarOpen();
  const dragControls = useDragControls();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogPortal>
        <DialogOverlay className="bg-background/70 fixed inset-0 z-40" />
        <DialogContent
          className={cn(
            "sm:w-sidebar-width bg-background/70 border-border-default fixed inset-y-0 right-0 z-50 w-full max-w-[calc(100dvw-3rem)] transform border-l backdrop-blur-xl"
          )}
          // style={{
          //   transform:
          //     dragStartX === -1 || dragX < 0
          //       ? undefined
          //       : `translateX(${dragX}px)`,
          // }}
          // draggable={false}
          // onPointerDown={(event) => {
          //   setDragStartX(event.clientX);
          // }}
          // onPointerMove={(event) => {
          //   if (dragStartX === -1) {
          //     return;
          //   }
          //   setDragX(event.clientX - dragStartX);
          // }}
          // onPointerUp={(e) => {
          //   if (dragX > e.currentTarget.clientWidth / 2) {
          //     void animate.start("closed");
          //     setOpen(false);
          //   }

          //   void animate.start("open");
          //   setDragStartX(-1);
          //   setDragX(0);
          // }}
          asChild
        >
          <motion.div
            drag="x"
            dragSnapToOrigin
            dragElastic={{ left: 0 }}
            dragConstraints={{ left: 0 }}
            dragControls={dragControls}
            onDragEnd={(event, info) => {
              if (event.target instanceof HTMLElement) {
                if (info.offset.x > event.target.clientWidth / 2) {
                  console.log("closing");
                  setOpen(false);
                }
              }
            }}
            variants={{
              open: {
                x: 0,
                transition: {
                  ease: "easeOut",
                  easings: [0.25, 0.46, 0.45, 0.94],
                },
              },
              closed: {
                x: "100%",
                transition: {
                  ease: "easeIn",
                  easings: [0.25, 0.46, 0.45, 0.94],
                },
              },
            }}
            initial="closed"
            animate="open"
            exit="closed"
          >
            <VisuallyHidden>
              <DialogTitle>Menu</DialogTitle>
            </VisuallyHidden>
            {children}
          </motion.div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}
