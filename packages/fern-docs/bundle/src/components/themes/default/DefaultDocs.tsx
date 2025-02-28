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
  AnimatePresence,
  motion,
  useDragControls,
  useMotionValue,
  useMotionValueEvent,
  useTransform,
} from "motion/react";

import { cn } from "@fern-docs/components";
import { useIsDesktop } from "@fern-ui/react-commons/src/useBreakpoint";

import { HeaderTabsRoot } from "@/components/header/HeaderTabsRoot";
import { SetIsSidebarFixed, useShouldHideAsides } from "@/state/layout";
import { useIsDismissableSidebarOpen } from "@/state/mobile";

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

const overlayVariants = {
  closed: { opacity: 0 },
  open: { opacity: 1 },
};

const dialogVariants = {
  closed: { x: "100%" },
  open: { x: 0 },
};

const transition = {
  ease: "easeInOut",
  easings: [0.25, 0.46, 0.45, 0.94],
  duration: 0.3,
};

function MobileMenu({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useIsDismissableSidebarOpen();

  const currentPath = usePathname();
  React.useEffect(() => {
    setOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPath]);

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

  // reset the transform when the menu is closed
  React.useLayoutEffect(() => {
    if (!mainRef.current) {
      return;
    }

    if (!sidebarRef.current) {
      return;
    }

    const setTransform = (width: number) => {
      if (open && mainRef.current && sidebarRef.current) {
        const transform = Math.min(0, calculateWidth(x.get(), width));
        mainRef.current.style.transform = `translateX(${transform}px)`;
      }
    };

    setTransform(sidebarRef.current.clientWidth);

    // update the transform when the sidebar is resized
    const observer = new ResizeObserver(([entry]) => {
      if (open && mainRef.current && entry) {
        setTransform(entry.contentRect.width);
      }
    });

    observer.observe(sidebarRef.current);

    return () => {
      observer.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // reset the transform when the component unmounts
  React.useEffect(
    () => () => {
      if (mainRef.current) {
        mainRef.current.style.transform = "";
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return (
    <Dialog open={open} onOpenChange={setOpen} modal={open}>
      <AnimatePresence
        initial={false}
        mode="popLayout"
        propagate
        onExitComplete={() => {
          if (!open && mainRef.current) {
            mainRef.current.style.transform = "";
          }
        }}
      >
        {open && (
          <DialogPortal forceMount>
            <DialogOverlay
              className="bg-background/70 fixed inset-0 top-[calc(var(--header-height)+1px)] z-30"
              asChild
              onClick={() => {
                const xValue = x.get() as string | number;
                if (xValue === 0 || xValue === "0%") {
                  setOpen(false);
                }
              }}
              forceMount
            >
              <motion.div
                style={{ opacity, touchAction: "none" }}
                variants={overlayVariants}
                initial="closed"
                animate="open"
                exit="closed"
                transition={transition}
                onPointerDown={(event) => dragControls.start(event)}
              ></motion.div>
            </DialogOverlay>
            <DialogContent
              className="sm:w-sidebar-width bg-background/70 border-border-concealed fixed inset-y-0 right-0 top-[calc(var(--header-height)+1px)] z-40 w-full max-w-[calc(100dvw-3rem)] border-l backdrop-blur-xl"
              onPointerDownOutside={(e) => e.preventDefault()}
              forceMount
              asChild
            >
              <motion.div
                ref={sidebarRef}
                onPointerDown={(event) => dragControls.start(event)}
                style={{ x, touchAction: "none" }}
                drag="x"
                dragDirectionLock
                dragSnapToOrigin
                dragListener={false}
                dragElastic={{ left: 0 }}
                dragConstraints={{ left: 0 }}
                dragControls={dragControls}
                onDragEnd={(event, info) => {
                  if (event.target instanceof HTMLElement) {
                    if (
                      info.offset.x > event.target.clientWidth / 2 ||
                      info.velocity.x > 100
                    ) {
                      setOpen(false);
                    }
                  }
                }}
                variants={dialogVariants}
                initial="closed"
                animate="open"
                exit="closed"
                transition={transition}
              >
                <VisuallyHidden>
                  <DialogTitle>Menu</DialogTitle>
                  <DialogDescription>
                    Navigation menu for docs.
                  </DialogDescription>
                </VisuallyHidden>
                {children}
              </motion.div>
            </DialogContent>
          </DialogPortal>
        )}
      </AnimatePresence>
    </Dialog>
  );
}
