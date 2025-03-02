"use client";

import React from "react";

import {
  isomorphicRequestAnimationFrame,
  useIsomorphicLayoutEffect,
} from "@fern-ui/react-commons";

import { scrollToCenter } from "@/components/util/scrollToCenter";

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
  useIsomorphicLayoutEffect(() => {
    const scrollTo = () => {
      const container = document.getElementById("sidebar-scroll-area");
      if (!container) return;

      const element = ref.current;
      if (!element) return;

      const containerBounds = container.getBoundingClientRect();
      const elementBounds = element.getBoundingClientRect();

      const isAbove = elementBounds.top < containerBounds.top;
      const isBelow = elementBounds.bottom > containerBounds.bottom;

      if (isAbove || isBelow) {
        scrollToCenter(container, element, isBelow);
      }
    };

    if (shouldScrollIntoView) {
      return isomorphicRequestAnimationFrame(() => {
        scrollTo();
      });
    }

    return;
  }, [shouldScrollIntoView]);
}
