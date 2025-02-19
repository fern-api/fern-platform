"use client";

import React from "react";

import { atom, useAtom, useAtomValue, useSetAtom } from "jotai";

import { useIsSelectedSidebarNode } from "./navigation";

const sidebarRefAtom = atom<React.RefObject<HTMLDivElement | null>>({
  current: null,
});
const sidebarScrollRestorationAtom = atom(0);

/**
 * In the app router the sidebar gets scrolled to the top between page loads.
 * This is a hack to measure the scroll position so that the sidebar scroll position is restored
 * when the sidebar is re-mounted.
 */
export function useDismountMeasureSidebarScrollPosition(
  ref: React.RefObject<HTMLDivElement | null>
) {
  const setSidebarRef = useSetAtom(sidebarRefAtom);
  const [scrollPosition, setSidebarScrollRestoration] = useAtom(
    sidebarScrollRestorationAtom
  );
  React.useEffect(() => {
    setSidebarRef(ref);

    if (ref.current && scrollPosition > 0) {
      ref.current.scrollTo({ top: scrollPosition, behavior: "instant" });
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
  const sidebarRef = useAtomValue(sidebarRefAtom);
  const shouldScrollIntoView = useIsSelectedSidebarNode(nodeId ?? ("" as any));
  React.useEffect(() => {
    if (shouldScrollIntoView) {
      // first, determine if the node is visible within the sidebarRef.current
      requestAnimationFrame(() => {
        const sidebarContainer = sidebarRef.current;
        const sidebarNode = ref.current;
        if (!sidebarContainer || !sidebarNode) {
          return;
        }

        const sidebarNodeRect = sidebarNode.getBoundingClientRect();
        const sidebarContainerRect = sidebarContainer.getBoundingClientRect();
        if (
          sidebarNodeRect.bottom < sidebarContainerRect.top ||
          sidebarNodeRect.top > sidebarContainerRect.bottom
        ) {
          sidebarContainer.scrollTo({
            top: sidebarNodeRect.top - sidebarContainerRect.height * 0.4,
            behavior: "instant",
          });
        }
      });
    }
  }, [shouldScrollIntoView]);
}
