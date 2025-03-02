"use client";

import React from "react";

import { cn } from "@fern-docs/components";

import { BgImageGradient } from "@/components/BgImageGradient";
import { HeaderTabsRoot } from "@/components/header/HeaderTabsRoot";
import { SidebarProvider } from "@/components/layouts/sidebar";
import { SetIsSidebarFixed } from "@/state/layout";

import { FernHeader } from "./fern-header";
import { MainCtx } from "./mobile-menu";
import { SidebarNav } from "./side-nav";

export default function DefaultDocs({
  header,
  sidebar,
  children,
  announcement,
  tabs,
  isSidebarFixed = false,
  isHeaderDisabled = false,
  showSearchBarInTabs = false,
}: {
  header: React.ReactNode;
  sidebar: React.ReactNode;
  children: React.ReactNode;
  announcement?: React.ReactNode;
  tabs?: React.ReactNode;
  isSidebarFixed?: boolean;
  isHeaderDisabled?: boolean;
  showSearchBarInTabs?: boolean;
}) {
  const mainRef = React.useRef<HTMLDivElement>(null);
  return (
    <SidebarProvider in={sidebar}>
      <SetIsSidebarFixed value={isSidebarFixed} />
      <FernHeader
        className={cn(
          "bg-header-background border-border-concealed pointer-events-auto fixed inset-x-0 top-0 z-30 border-b backdrop-blur-lg",
          { "lg:hidden": isHeaderDisabled }
        )}
      >
        <div className="clipped-background opacity-50">
          <BgImageGradient />
        </div>
        {announcement}
        <div className="h-(--mobile-header-height-real) md:h-(--header-height-real) px-page-padding flex items-center">
          {header}
        </div>
        <HeaderTabsRoot showSearchBar={showSearchBarInTabs}>
          {tabs}
        </HeaderTabsRoot>
      </FernHeader>

      <MainCtx.Provider value={mainRef}>
        <main ref={mainRef} className="mt-(--header-height) relative z-0 flex">
          <SidebarNav />
          {children}
        </main>
      </MainCtx.Provider>

      {/* Enables footer DOM injection */}
      <footer id="fern-footer" />
    </SidebarProvider>
  );
}
