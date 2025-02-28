"use client";

import { usePathname } from "next/navigation";
import React from "react";
import { RemoveScroll } from "react-remove-scroll";

import { Portal } from "@radix-ui/react-portal";
import fastdom from "fastdom";
import {
  AnimatePresence,
  motion,
  useDragControls,
  useMotionValue,
  useMotionValueEvent,
  useTransform,
} from "motion/react";
import { noop } from "ts-essentials";

import { cn } from "@fern-docs/components";
import { useIsomorphicLayoutEffect } from "@fern-ui/react-commons";
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

  const mainRef = React.useContext(MainCtx);

  const cancel = React.useRef<() => void>(noop);
  useMotionValueEvent(x, "change", (value) => {
    cancel.current();
    cancel.current = fastdom.mutate(() => {
      const sidebar = document.getElementById("fern-sidebar");
      if (!sidebar || !mainRef.current) return;
      mainRef.current.style.willChange = "transform";
      mainRef.current.style.transform = `translateX(${Math.min(
        0,
        calculateWidth(value, sidebar.clientWidth)
      )}px)`;
    });
  });

  const opacity = useTransform(x, (value) => {
    const width = document.getElementById("fern-sidebar")?.clientWidth ?? 0;
    if (width <= 0) {
      return 0;
    }
    return (-1 * calculateWidth(value, width)) / width;
  });

  // reset the transform when the menu is closed
  useIsomorphicLayoutEffect(() => {
    if (!mainRef.current) {
      return;
    }

    const setTransform = (width: number) => {
      if (open && mainRef.current) {
        const transform = Math.min(0, calculateWidth(x.get(), width));
        mainRef.current.style.willChange = "transform";
        mainRef.current.style.transform = `translateX(${transform}px)`;
      }
    };

    const sidebar = document.getElementById("fern-sidebar");
    if (!sidebar) return;

    setTransform(sidebar.clientWidth);

    // update the transform when the sidebar is resized
    const observer = new ResizeObserver(([entry]) => {
      if (open && mainRef.current && entry) {
        setTransform(entry.contentRect.width);
      }
    });

    observer.observe(sidebar);

    return () => {
      observer.disconnect();
    };
  }, [open]);

  // reset the transform when the component unmounts
  React.useEffect(
    () => () => {
      if (mainRef.current) {
        mainRef.current.style.transform = "";
        mainRef.current.style.willChange = "";
      }
      cancel.current();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const [isLocked, setIsLocked] = React.useState(false);
  useIsomorphicLayoutEffect(() => {
    if (open) {
      setIsLocked(true);
    }
  }, [open]);

  return (
    <RemoveScroll forwardProps enabled={isLocked || open}>
      <Portal className="pointer-events-none fixed inset-0">
        <AnimatePresence
          mode="popLayout"
          onExitComplete={() => {
            setIsLocked(false);
            if (mainRef.current) {
              mainRef.current.style.transform = "";
              mainRef.current.style.willChange = "";
            }
          }}
        >
          {open && (
            <motion.div
              className="bg-background/70 pointer-events-auto fixed inset-0 top-[calc(var(--header-height)+1px)] z-30"
              key="overlay"
              style={{ opacity, touchAction: "none" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={transition}
              onPointerDown={(event) => dragControls.start(event)}
              onClick={() => {
                const xValue = x.get() as string | number;
                if (xValue === 0 || xValue === "0%") {
                  setOpen(false);
                }
              }}
            />
          )}
          {open && (
            <motion.div
              id="fern-sidebar"
              className="sm:w-sidebar-width bg-background/70 border-border-concealed pointer-events-auto fixed inset-y-0 right-0 top-[calc(var(--header-height)+1px)] z-40 flex w-full max-w-[calc(100dvw-3rem)] flex-col border-l backdrop-blur-xl"
              key="sidebar"
              onPointerDown={(event) => dragControls.start(event)}
              onDragStart={() => {
                if (mainRef.current) {
                  mainRef.current.style.willChange = "transform";
                }
              }}
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
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={transition}
            >
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </Portal>
    </RemoveScroll>
  );
}
