"use client";

import { useTheme } from "next-themes";
import React from "react";

import { cn } from "@fern-docs/components";

import { HeaderTabsRoot } from "@/components/header/HeaderTabsRoot";
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
  lightHeaderClassName,
  darkHeaderClassName,
  lightSidebarClassName,
  darkSidebarClassName,
}: {
  header: React.ReactNode;
  sidebar: React.ReactNode;
  children: React.ReactNode;
  announcement?: React.ReactNode;
  tabs?: React.ReactNode;
  isSidebarFixed?: boolean;
  isHeaderDisabled?: boolean;
  showSearchBarInTabs?: boolean;
  lightHeaderClassName?: string;
  darkHeaderClassName?: string;
  lightSidebarClassName?: string;
  darkSidebarClassName?: string;
}) {
  const { resolvedTheme } = useTheme();
  const headerClassName =
    resolvedTheme === "dark" ? darkHeaderClassName : lightHeaderClassName;
  const sidebarClassName =
    resolvedTheme === "dark" ? darkSidebarClassName : lightSidebarClassName;
  const mainRef = React.useRef<HTMLDivElement>(null);
  return (
    <>
      <SetIsSidebarFixed value={isSidebarFixed} />
      <div className="fern-background-image pointer-events-none fixed inset-0" />
      <FernHeader
        className={cn(
          "bg-header-background border-border-concealed fern-background-image pointer-events-auto fixed inset-x-0 top-0 z-30 border-b backdrop-blur-lg",
          { "lg:hidden": isHeaderDisabled },
          headerClassName
        )}
      >
        {announcement}
        <div className="h-(--mobile-header-height-real) md:h-(--header-height-real) px-page-padding width-before-scroll-bar flex items-center">
          {header}
        </div>
        <HeaderTabsRoot
          showSearchBar={showSearchBarInTabs}
          className="width-before-scroll-bar"
        >
          {tabs}
        </HeaderTabsRoot>
      </FernHeader>

      <MainCtx.Provider value={mainRef}>
        <main ref={mainRef} className="mt-(--header-height) relative z-0 flex">
          <SidebarNav className={sidebarClassName}>{sidebar}</SidebarNav>
          {children}
        </main>
      </MainCtx.Provider>

      {/* Enables footer DOM injection */}
      <footer id="fern-footer width-before-scroll-bar" />
    </>
  );
}
