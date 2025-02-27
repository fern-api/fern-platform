"use client";

import { usePathname } from "next/navigation";
import React from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from "@radix-ui/react-dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import fastdom from "fastdom";
import {
  motion,
  useAnimationControls,
  useDragControls,
  useMotionValue,
  useMotionValueEvent,
  useTransform,
} from "motion/react";

import { cn } from "@fern-docs/components";
import { useIsDesktop } from "@fern-ui/react-commons/src/useBreakpoint";

import { HeaderTabsRoot } from "@/components/header/HeaderTabsRoot";
import { SetIsSidebarFixed, useShouldHideAsides } from "@/state/layout";
import {
  useCloseDismissableSidebar,
  useIsDismissableSidebarOpen,
} from "@/state/mobile";

import { FernHeader } from "./fern-header";

const MainCtx = React.createContext<React.RefObject<HTMLDivElement | null>>({
  current: null,
});

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
  const mainRef = React.useRef<HTMLDivElement>(null);
  const hideAsides = useShouldHideAsides();
  return (
    <>
      <SetIsSidebarFixed value={isSidebarFixed} />
      <FernHeader
        className={cn(
          "bg-header-background border-border-concealed pointer-events-auto fixed inset-x-0 top-0 z-30 border-b backdrop-blur-lg",
          { "lg:hidden": isHeaderDisabled }
        )}
      >
        {announcement}
        <div className="h-header-height-real px-page-padding flex items-center">
          {header}
        </div>
        <HeaderTabsRoot>{tabs}</HeaderTabsRoot>
      </FernHeader>

      <MainCtx.Provider value={mainRef}>
        <main ref={mainRef} className="mt-(--header-height) relative z-0">
          <div
            className={cn("max-w-page-width-padded mx-auto flex flex-row", {
              "[&>aside]:lg:hidden": hideAsides,
            })}
          >
            <SideNav fixed={isSidebarFixed}>{sidebar}</SideNav>
            {children}
          </div>
        </main>
      </MainCtx.Provider>

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

function calculateWidth(value: number | string, sidebarWidth: number) {
  if (typeof value === "string" && value.endsWith("%")) {
    value = (parseFloat(value.slice(0, -1)) / 100) * sidebarWidth;
  }
  if (typeof value === "number") {
    return value - sidebarWidth;
  }
  return 0;
}

function MobileMenu({ children }: { children: React.ReactNode }) {
  const animation = useAnimationControls();
  const [open, setOpen] = useIsDismissableSidebarOpen();
  const dragControls = useDragControls();
  const x = useMotionValue(0);

  const sidebarRef = React.useRef<HTMLDivElement>(null);
  const mainRef = React.useContext(MainCtx);

  // const translateX = useTransform(x, (value) =>
  //   calculateWidth(value, sidebarRef.current?.clientWidth ?? 0)
  // );

  useMotionValueEvent(x, "change", (value) => {
    fastdom.mutate(() => {
      if (mainRef.current && sidebarRef.current) {
        mainRef.current.style.transform = `translateX(${Math.min(
          0,
          calculateWidth(value, sidebarRef.current.clientWidth)
        )}px)`;
      }
    });
  });

  const opacity = useTransform(x, (value) => {
    const width = sidebarRef.current?.clientWidth ?? 0;
    if (width <= 0) {
      return 0;
    }
    return (-1 * calculateWidth(value, width)) / width;
  });

  React.useLayoutEffect(() => {
    if (mainRef.current) {
      if (!open) {
        mainRef.current.style.transform = "";
      }
    }
  }, [animation, mainRef, open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogPortal>
        <DialogOverlay
          className="bg-background/70 fixed inset-0 top-[calc(var(--header-height)+1px)] z-30"
          asChild
          onClick={() => setOpen(false)}
        >
          <motion.div style={{ opacity }}></motion.div>
        </DialogOverlay>
        <DialogContent
          className="sm:w-sidebar-width bg-background/70 border-border-concealed fixed inset-y-0 right-0 top-[calc(var(--header-height)+1px)] z-40 w-full max-w-[calc(100dvw-3rem)] transform border-l backdrop-blur-xl"
          asChild
          onPointerDownOutside={(e) => e.preventDefault()}
        >
          <motion.div
            ref={sidebarRef}
            style={{ x }}
            drag="x"
            dragSnapToOrigin
            dragElastic={{ left: 0 }}
            dragConstraints={{ left: 0 }}
            dragControls={dragControls}
            onDragEnd={(event, info) => {
              if (event.target instanceof HTMLElement) {
                if (
                  info.offset.x > event.target.clientWidth / 2 ||
                  info.velocity.x > 20
                ) {
                  void animation
                    .start({
                      x: "100%",
                    })
                    .then(() => {
                      setOpen(false);
                    });
                }
              }
            }}
            variants={{ open: { x: 0 }, closed: { x: "100%" } }}
            initial="closed"
            animate="open"
            transition={{
              ease: "easeInOut",
              easings: [0.25, 0.46, 0.45, 0.94],
            }}
          >
            <VisuallyHidden>
              <DialogTitle>Menu</DialogTitle>
              <DialogDescription>Navigation menu for docs.</DialogDescription>
            </VisuallyHidden>
            {children}
          </motion.div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}
