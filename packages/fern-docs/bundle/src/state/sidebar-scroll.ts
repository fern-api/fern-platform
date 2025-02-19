"use client";

import React from "react";

import { atom, useAtom, useAtomValue, useSetAtom } from "jotai";
import { noop } from "ts-essentials";

import { useIsSelectedSidebarNode } from "./navigation";

const sidebarScrollRestorationAtom = atom(0);

/**
 * In the app router the sidebar gets scrolled to the top between page loads.
 * This is a hack to measure the scroll position so that the sidebar scroll position is restored
 * when the sidebar is re-mounted.
 */
export function useDismountMeasureSidebarScrollPosition(
  ref: React.RefObject<HTMLDivElement | null>
) {
  const [scrollPosition, setSidebarScrollRestoration] = useAtom(
    sidebarScrollRestorationAtom
  );
  React.useEffect(() => {
    if (ref.current && scrollPosition > 0) {
      ref.current.scrollTop = scrollPosition;
    }

    return () => {
      if (ref.current) {
        setSidebarScrollRestoration(ref.current.scrollTop);
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
