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

          while (currentElement && currentElement !== container) {
            offsetTop += currentElement.offsetTop;
            currentElement = currentElement.offsetParent as HTMLElement | null;
          }

          return offsetTop;
        };

        // Get the vertical position of the node relative to the container
        const nodeOffsetTop = getOffsetTop(sidebarNode);
        const containerScrollTop = container.scrollTop;
        const containerHeight = container.offsetHeight;

        // Check if the node is outside the visible area of the container
        const isAbove = nodeOffsetTop < containerScrollTop;
        const isBelow =
          nodeOffsetTop + sidebarNode.offsetHeight >
          containerScrollTop + containerHeight;

        if (isAbove || isBelow) {
          container.scrollTo({
            top: nodeOffsetTop - containerHeight / 2 + container.offsetTop / 2,
            behavior: "smooth",
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
