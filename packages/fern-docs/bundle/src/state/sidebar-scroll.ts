"use client";

import React from "react";

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
    window._FERN_SIDEBAR_SCROLL_RESTORATION ??= 0;
    if (ref.current && window._FERN_SIDEBAR_SCROLL_RESTORATION > 0) {
      ref.current.scrollTop = window._FERN_SIDEBAR_SCROLL_RESTORATION;
    }

    return () => {
      if (ref.current) {
        window._FERN_SIDEBAR_SCROLL_RESTORATION = ref.current.scrollTop;
      }
    };
  }, []);
}

export function useScrollSidebarNodeIntoView(
  ref: React.RefObject<HTMLDivElement | null>,
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
        const sidebarNodeRect = sidebarNode.getBoundingClientRect();
        const sidebarContainerRect = container.getBoundingClientRect();
        if (
          sidebarNodeRect.top < sidebarContainerRect.top ||
          sidebarNodeRect.bottom > sidebarContainerRect.bottom
        ) {
          container.scrollTo({
            top:
              sidebarNodeRect.top -
              sidebarContainerRect.top -
              sidebarContainerRect.height * 0.4,
            behavior: "instant",
          });
        }
      } catch (error) {
        console.error(error);
      }
    };

    if (shouldScrollIntoView) {
      requestIdleCallback(() => {
        scrollTo();
      });
    }

    return;
  }, [shouldScrollIntoView]);
}
