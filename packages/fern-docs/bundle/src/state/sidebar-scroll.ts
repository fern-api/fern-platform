"use client";

import React from "react";

import {
  isomorphicRequestIdleCallback,
  useIsomorphicLayoutEffect,
} from "@fern-ui/react-commons";

import { scrollToCenter } from "@/components/util/scrollToCenter";

import { useIsSelectedSidebarNode } from "./navigation";

let justScrolledTo: string | undefined;

export function useRestoreSidebarScrollPosition() {
  useIsomorphicLayoutEffect(() => {
    const container = document.getElementById("sidebar-scroll-area");
    if (!container) return;
    container.scrollTop = window._FERN_SIDEBAR_SCROLL_RESTORATION ?? 0;
  }, []);
}

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

    const handleScroll = (e: Event) => {
      const target = e.target as HTMLElement;
      // 16 seems to be the magic number for a scroll-to-top event
      if (target.scrollTop !== 16) {
        window._FERN_SIDEBAR_SCROLL_RESTORATION = target.scrollTop;
      } else {
        target.scrollTop = window._FERN_SIDEBAR_SCROLL_RESTORATION ?? 16;
      }
    };

    current.addEventListener("scroll", handleScroll);

    return () => {
      current.removeEventListener("scroll", handleScroll);
      justScrolledTo = undefined;
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
      container.scrollTop = window._FERN_SIDEBAR_SCROLL_RESTORATION ?? 0;

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
      if (justScrolledTo === nodeId) {
        return;
      }
      justScrolledTo = nodeId;
      window.__FERN_CANCEL_SCROLL_SIDEBAR_NODE_INTO_VIEW?.();
      const cancel = isomorphicRequestIdleCallback(() => {
        scrollTo();
      });
      window.__FERN_CANCEL_SCROLL_SIDEBAR_NODE_INTO_VIEW = cancel;
      return cancel;
    }

    return;
  }, [shouldScrollIntoView]);
}
