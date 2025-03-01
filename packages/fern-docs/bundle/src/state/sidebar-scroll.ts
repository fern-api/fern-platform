"use client";

import React from "react";

import { isomorphicRequestIdleCallback } from "@/components/util/isomorphicRequestIdleCallback";

import { useIsSelectedSidebarNode } from "./navigation";

/**
 * In the app router the sidebar gets scrolled to the top between page loads.
 * This is a hack to measure the scroll position so that the sidebar scroll position is restored
 * when the sidebar is re-mounted.
 */
export function useDismountMeasureSidebarScrollPosition(
  ref: React.RefObject<HTMLDivElement | null>
) {
  React.useEffect(() => {
    const current = ref.current;
    window._FERN_SIDEBAR_SCROLL_RESTORATION ??= 0;
    if (current && window._FERN_SIDEBAR_SCROLL_RESTORATION > 0) {
      current.scrollTop = window._FERN_SIDEBAR_SCROLL_RESTORATION;
    }

    if (current == null) {
      return;
    }

    const handleScroll = () => {
      window._FERN_SIDEBAR_SCROLL_RESTORATION = current.scrollTop ?? 0;
    };

    current.addEventListener("scroll", handleScroll);

    return () => {
      current.removeEventListener("scroll", handleScroll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

export function useScrollSidebarNodeIntoView(
  ref: React.RefObject<HTMLElement | null>,
  nodeId?: string
) {
  const shouldScrollIntoView = useIsSelectedSidebarNode(nodeId ?? ("" as any));
  React.useEffect(() => {
    const scrollTo = () => {
      const container = document.getElementById("sidebar-scroll-area");
      const sidebarNode = ref.current;
      if (!sidebarNode || !container) {
        return;
      }
      try {
        // Get the offset from the top without using getBoundingClientRect
        // Calculate the offset by traversing the DOM tree and summing offsetTop values
        const getOffsetTop = (element: HTMLElement): number => {
          let offsetTop = 0;
          let currentElement: HTMLElement | null = element;

          while (
            currentElement &&
            currentElement.id !== "sidebar-scroll-area"
          ) {
            offsetTop += currentElement.offsetTop;
            currentElement = currentElement.offsetParent as HTMLElement | null;
          }

          if (!currentElement || currentElement.id !== "sidebar-scroll-area") {
            return -1;
          }

          return offsetTop;
        };

        // Get the vertical position of the node relative to the container
        const nodeOffsetTop = getOffsetTop(sidebarNode);

        if (nodeOffsetTop < 0) {
          return;
        }

        const containerScrollTop = container.scrollTop;
        const containerHeight = container.offsetHeight;

        // Check if the node is outside the visible area of the container
        const isAbove = nodeOffsetTop < containerScrollTop;
        const isBelow =
          nodeOffsetTop + sidebarNode.offsetHeight >
          containerScrollTop + containerHeight;

        if (isAbove || isBelow) {
          const top =
            nodeOffsetTop - containerHeight / 2 + container.offsetTop / 2;
          if (top < 0) {
            return;
          }
          container.scrollTo({
            top,
            behavior:
              Math.abs(container.scrollTop - top) < container.offsetHeight / 2
                ? "smooth"
                : "auto",
          });
        }
      } catch (error) {
        console.error(error);
      }
    };

    if (shouldScrollIntoView) {
      return isomorphicRequestIdleCallback(() => {
        scrollTo();
      });
    }

    return;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldScrollIntoView]);
}
