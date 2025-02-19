"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import React from "react";

import { cn } from "@fern-docs/components";
import { useIsMobile } from "@fern-ui/react-commons";

import { HeaderTabsRoot } from "@/components/header/HeaderTabsRoot";
import { useLayout, useShouldHideAsides } from "@/state/layout";
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
  const hideAsides = useShouldHideAsides();
  return (
    <>
      <FernHeader className="bg-header-background border-border-concealed fixed inset-x-0 top-0 z-30 border-b backdrop-blur-lg">
        {announcement}
        <div className="h-header-height-real px-page-padding flex items-center">
          {header}
        </div>
        <HeaderTabsRoot>{tabs}</HeaderTabsRoot>
      </FernHeader>

      <main className="mt-(--header-height) relative z-0">
        <div
          className={cn("max-w-page-width-padded mx-auto flex flex-row", {
            "[&>aside]:lg:hidden": hideAsides,
          })}
        >
          <SideNav>{sidebar}</SideNav>
          {children}
        </div>
      </main>

      {/* Enables footer DOM injection */}
      <footer id="fern-footer" />
    </>
  );
}

function SideNav({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();
  const isDismissableSidebarOpen = useIsDismissableSidebarOpen();
  const closeDismissableSidebar = useCloseDismissableSidebar();
  const currentPath = usePathname();
  React.useEffect(() => {
    closeDismissableSidebar();
  }, [currentPath]);

  React.useEffect(() => {
    const main = document.getElementsByTagName("main")[0];
    if (!main) {
      return;
    }

    if (isMobile && isDismissableSidebarOpen) {
      document.body.style.overflow = "hidden";
      main.style.pointerEvents = "none";
    }

    return () => {
      document.body.style.overflow = "";
      main.style.pointerEvents = "";
    };
  }, [isMobile, isDismissableSidebarOpen]);

  return (
    <>
      <div
        className="bg-background/50 top-(--header-height) pointer-events-none fixed inset-0 z-20 hidden data-[mobile-state=open]:pointer-events-auto data-[mobile-state=open]:block lg:!hidden"
        onClick={closeDismissableSidebar}
        data-mobile-state={isDismissableSidebarOpen ? "open" : "closed"}
      />
      <aside
        className={cn(
          "pointer-events-auto",
          "z-30",
          "lg:sticky lg:flex lg:h-fit lg:max-h-[calc(100dvh-var(--header-height))] lg:shrink-0 lg:translate-x-0 lg:flex-col lg:border-r-0 lg:opacity-100 lg:transition-none",
          "sm:ease-shift data-[mobile-state=closed]:!transition-none sm:-translate-x-full sm:opacity-0 sm:transition-[transform,opacity] sm:duration-150 sm:will-change-auto sm:data-[mobile-state=open]:translate-x-0 sm:data-[mobile-state=open]:opacity-100",
          "sm:border-border-default sm:w-(--spacing-sidebar-width) sm:flex sm:border-r",
          "bg-background/70 fixed inset-0 hidden w-dvw backdrop-blur-xl data-[mobile-state=open]:flex",
          "top-(--header-height)"
        )}
        data-mobile-state={isDismissableSidebarOpen ? "open" : "closed"}
      >
        {children}
      </aside>
    </>
  );
}
