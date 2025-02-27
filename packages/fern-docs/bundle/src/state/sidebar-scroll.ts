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
    const current = ref.current;
    window._FERN_SIDEBAR_SCROLL_RESTORATION ??= 0;
    if (current && window._FERN_SIDEBAR_SCROLL_RESTORATION > 0) {
      current.scrollTop = window._FERN_SIDEBAR_SCROLL_RESTORATION;
    }

    const handleScroll = () => {
      window._FERN_SIDEBAR_SCROLL_RESTORATION = current?.scrollTop ?? 0;
    };

    current?.addEventListener("scroll", handleScroll);

    return () => {
      current?.removeEventListener("scroll", handleScroll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      const rIC = requestIdleCallback ?? setTimeout;
      rIC(() => {
        scrollTo();
      });
    }

    return;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldScrollIntoView]);
}
