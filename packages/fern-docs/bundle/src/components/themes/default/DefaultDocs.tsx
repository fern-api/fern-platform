"use client";

import { cn } from "@fern-docs/components";

import { useLayout } from "@/state/layout";
import {
  useCloseDismissableSidebar,
  useIsDismissableSidebarOpen,
} from "@/state/mobile";

import { FernHeader } from "./fern-header";

export default function DefaultDocs({
  header,
  sidebar,
  children,
  announcement,
  tabs,
}: {
  header: React.ReactNode;
  sidebar: React.ReactNode;
  children: React.ReactNode;
  announcement?: React.ReactNode;
  tabs?: React.ReactNode;
}) {
  const layout = useLayout();
  const isDismissableSidebarOpen = useIsDismissableSidebarOpen();
  const closeDismissableSidebar = useCloseDismissableSidebar();
  return (
    <>
      <FernHeader className="bg-header-background border-concealed fixed inset-x-0 top-0 z-30 border-b backdrop-blur-lg">
        {announcement}
        <div className="h-header-height-real flex items-center">{header}</div>
        {tabs}
      </FernHeader>

      <main className="max-w-page-width relative z-0 mx-auto mt-(--header-height) flex flex-row">
        <div
          className="bg-background/50 pointer-events-none fixed inset-0 top-(--header-height) z-20 hidden data-[mobile-state=open]:pointer-events-auto data-[mobile-state=open]:block lg:!hidden"
          onClick={closeDismissableSidebar}
          data-mobile-state={isDismissableSidebarOpen ? "open" : "closed"}
        />
        <aside
          className={cn(
            "top-(--header-height) z-30",
            "lg:sticky lg:flex lg:h-fit lg:max-h-[calc(100dvh-var(--header-height))] lg:shrink-0 lg:translate-x-0 lg:flex-col lg:border-r-0 lg:opacity-100 lg:transition-none",
            "sm:ease-shift data-[mobile-state=closed]:!transition-none sm:-translate-x-full sm:opacity-0 sm:transition-[transform,opacity] sm:duration-150 sm:will-change-auto sm:data-[mobile-state=open]:translate-x-0 sm:data-[mobile-state=open]:opacity-100",
            "sm:border-concealed sm:flex sm:w-(--spacing-sidebar-width) sm:border-r",
            "bg-background/70 fixed hidden h-[calc(100dvh-var(--header-height))] w-dvw backdrop-blur-xl data-[mobile-state=open]:flex",
            { "lg:hidden": layout === "page" }
          )}
          data-mobile-state={isDismissableSidebarOpen ? "open" : "closed"}
        >
          {sidebar}
        </aside>

        {children}
      </main>

      {/* Enables footer DOM injection */}
      <footer id="fern-footer" />
    </>
  );
}
