"use client";

import { usePathname } from "next/navigation";
import React from "react";

import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Drawer } from "vaul";

import { slugjoin } from "@fern-api/fdr-sdk/navigation";
import { useIsomorphicLayoutEffect } from "@fern-ui/react-commons";

import { useHeaderHeight, useViewportSize } from "../hooks/useViewportSize";
import { isExplorerRoute, withoutExplorerRoute } from "./utils/explorer-route";

export function PlaygroundDrawer({ children }: { children: React.ReactNode }) {
  const [snap, setSnap] = React.useState<number | string | null>(1);
  const pathname = usePathname();
  const open = isExplorerRoute(pathname);

  const viewport = useViewportSize();
  const headerHeight = useHeaderHeight();

  useIsomorphicLayoutEffect(() => {
    if (open) {
      setSnap(1);
      setTimeout(() => {
        if (open) {
          document.body.style.pointerEvents = "auto";
        }
        // transition takes 500ms to complete
      }, 500);
    }
  }, [open]);

  return (
    <Drawer.Root
      open={open}
      onOpenChange={console.log}
      modal={false}
      dismissible={false}
      disablePreventScroll
      snapPoints={[
        `${headerHeight + 61}px`,
        `${viewport.height / 2 + headerHeight / 2 + 1}px`,
        1,
      ]}
      activeSnapPoint={snap}
      setActiveSnapPoint={setSnap}
      snapToSequentialPoint
      noBodyStyles
      preventScrollRestoration
      // reposition inputs seem to be quite buggy with the way the playground is implemented
      repositionInputs={false}
    >
      <Drawer.Portal>
        <Drawer.Overlay />
        <Drawer.Content
          onCloseAutoFocus={(e) => {
            e.preventDefault();
            document
              .getElementById(
                `playground-button:${slugjoin(withoutExplorerRoute(pathname))}`
              )
              ?.focus();
          }}
          className="bg-background-translucent rounded-t-4 border-border-default width-before-scroll-bar fixed inset-x-0 bottom-0 z-40 flex h-[calc(100dvh-var(--header-height))] max-h-[calc(100dvh*.95)] flex-col border-l border-r border-t outline-none backdrop-blur-2xl"
        >
          <Drawer.Handle
            className="bg-(color:--grayscale-a4) absolute mx-auto -mb-1.5 h-1.5 w-12 flex-shrink-0 -translate-y-4 rounded-full"
            preventCycle
          />
          <VisuallyHidden>
            <Drawer.Title>API Explorer</Drawer.Title>
            <Drawer.Description>
              Browse, explore, and try out API endpoints without leaving the
              documentation.
            </Drawer.Description>
          </VisuallyHidden>
          {children}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
