"use client";

import React from "react";
import { RemoveScroll } from "react-remove-scroll";

import { Portal } from "@radix-ui/react-portal";
import { compact } from "es-toolkit/array";
import {
  AnimatePresence,
  motion,
  useDragControls,
  useMotionValue,
  useMotionValueEvent,
  useTransform,
} from "motion/react";

import { cn } from "@fern-docs/components";
import { useIsomorphicLayoutEffect } from "@fern-ui/react-commons";

import {
  FERN_HEADER_ID,
  FERN_SIDEBAR_ID,
  FERN_SIDEBAR_OVERLAY_ID,
} from "@/components/constants";
import { useCurrentPathname } from "@/hooks/use-current-pathname";
import { useIsDismissableSidebarOpen } from "@/state/mobile";

export const MainCtx = React.createContext<
  React.RefObject<HTMLDivElement | null>
>({
  current: null,
});

const transition = {
  ease: "easeInOut",
  easings: [0.25, 0.46, 0.45, 0.94],
  duration: 0.3,
};

export function MobileMenu({
  children,
  className,
  ...props
}: {
  children: React.ReactNode;
  className?: string;
  "data-theme"?: string;
}) {
  const [open, setOpen] = useIsDismissableSidebarOpen();

  // Close the sidebar when the path changes
  const currentPath = useCurrentPathname();
  React.useEffect(() => {
    setOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPath]);

  const dragControls = useDragControls();
  const x = useMotionValue(0);

  const mainRef = React.useContext(MainCtx);

  // shift the main content when the sidebar is open
  useMotionValueEvent(x, "change", (value) => {
    if (!mainRef.current) return;
    mainRef.current.style.willChange = "transform";
    const translateX = Math.min(0, calculateWidth(value, getSidebarWidth()));
    mainRef.current.style.transform = `translateX(${translateX}px)`;
  });

  const opacity = useTransform(x, (value) => {
    const width = getSidebarWidth();
    if (width <= 0) return 0;
    return (-1 * calculateWidth(value, width)) / width;
  });

  const [isLocked, setIsLocked] = React.useState(false);

  // reset the transform when the menu is closed
  useIsomorphicLayoutEffect(() => {
    if (!mainRef.current) return;

    const setTransform = (width: number) => {
      if (!mainRef.current) return;
      if (open) {
        setIsLocked(true);
        const transform = Math.min(0, calculateWidth(x.get(), width));
        mainRef.current.style.willChange = "transform";
        mainRef.current.style.transform = `translateX(${transform}px)`;
      } else {
        mainRef.current.style.transform = "";
        mainRef.current.style.willChange = "";
      }
    };

    setTransform(getSidebarWidth());
  }, [open]);

  // reset the transform when the component unmounts
  React.useEffect(
    () => () => {
      if (mainRef.current) {
        mainRef.current.style.transform = "";
        mainRef.current.style.willChange = "";
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  React.useEffect(() => {
    let maybeIsDragging = false;

    const handlePointerDown = (event: PointerEvent) => {
      // Don't trigger if the event is inside a Radix popover/dropdown
      if (event.target instanceof Element) {
        const isInsidePopoverOrDialog = event.target.closest(
          '[data-radix-popper-content-wrapper], [role="dialog"]'
        );
        if (isInsidePopoverOrDialog) {
          return;
        }

        // Don't trigger if the event is inside a container with horizontal scroll
        const isInsideHorizontalScroll = (element: Element): boolean => {
          let current = element;
          while (current && current !== document.body) {
            const style = window.getComputedStyle(current);
            const hasHorizontalScroll =
              current.scrollWidth > current.clientWidth &&
              (style.overflowX === "auto" ||
                style.overflowX === "scroll" ||
                style.overflow === "auto" ||
                style.overflow === "scroll");

            if (hasHorizontalScroll) {
              return true;
            }

            current = current.parentElement as Element;
          }
          return false;
        };

        if (isInsideHorizontalScroll(event.target)) {
          return;
        }
      }

      if (event.buttons === 1) {
        maybeIsDragging = true;
      }
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (open || !maybeIsDragging) {
        return;
      }

      if (Math.abs(event.movementY) > 10) {
        maybeIsDragging = false;
        return;
      }

      // register a swipe gesture where the pointer is moving left and not up or down (with some margin of error)
      if (event.movementX < -5) {
        // Only trigger if pointer is in the right 33% of the screen
        const screenWidth = window.innerWidth;
        const rightEdgeThreshold = screenWidth * 0.66;

        // Don't open sidebar if user is currently selecting text
        const selection = document.getSelection();
        const hasTextSelection = selection && !selection.isCollapsed;

        if (event.clientX >= rightEdgeThreshold && !hasTextSelection) {
          setOpen(true);
          document.getSelection()?.empty();
        }
      }
    };

    const handleCancelDrag = () => {
      maybeIsDragging = false;
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("pointermove", handlePointerMove);
    document.addEventListener("selectionchange", handleCancelDrag);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("selectionchange", handleCancelDrag);
    };
  }, [dragControls, open, setOpen]);

  return (
    <RemoveScroll
      forwardProps
      enabled={isLocked || open}
      shards={
        typeof window === "undefined"
          ? []
          : compact([
              document.getElementById(FERN_HEADER_ID),
              document.getElementById(FERN_SIDEBAR_ID),
              document.getElementById(FERN_SIDEBAR_OVERLAY_ID),
            ])
      }
    >
      <Portal className="pointer-events-none fixed inset-0" {...props}>
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
              layoutRoot
              id={FERN_SIDEBAR_OVERLAY_ID}
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
              layoutRoot
              // Note: if this component must not be rendered at the same time as the side-nav.tsx component,
              // because they share the same ID.
              id={FERN_SIDEBAR_ID}
              data-viewport="mobile"
              className={cn("fern-background-image", className)}
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

function calculateWidth(value: number | string, sidebarWidth: number) {
  if (typeof value === "string" && value.endsWith("%")) {
    value = (parseFloat(value.slice(0, -1)) / 100) * sidebarWidth;
  }
  if (typeof value === "number") {
    return value - sidebarWidth;
  }
  return 0;
}

function getSidebarWidth() {
  const sidebar = document.getElementById(FERN_SIDEBAR_ID);
  if (!sidebar) return 0;
  return sidebar.clientWidth;
}
