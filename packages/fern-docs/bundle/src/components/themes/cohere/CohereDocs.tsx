"use client";

import { useTheme } from "next-themes";
import React, { useEffect, useRef } from "react";

import { useSetAtom } from "jotai";

import { cn } from "@fern-docs/components";
import { FernScrollArea } from "@fern-docs/components";

import { HeaderTabsRoot } from "@/components/header/HeaderTabsRoot";
import { useCurrentPathname } from "@/hooks/use-current-pathname";
import { SCROLL_BODY_ATOM } from "@/state/viewport";

import { FernHeader } from "../default/fern-header";
import { MainCtx } from "../default/mobile-menu";
import { SidebarNav } from "../default/side-nav";

const CohereDocsStyle = () => {
  return (
    <style jsx global>
      {`
        :root {
          --header-offset: 0px;
          --border-color-card: #d8cfc1;
          --bg-color-search-dialog: #fafafa;
          --bg-color-header-tab-inactive-hover: #f5f5f5;
          --border-color-header-tab-active: #d8cfc1;
          --bg-color-header-tab-active: #e8e6de;
        }

        .dark {
          --bg-color-card: #0f0f0f;
          --border-color-card: #4d4d4d;
          --bg-color-search-dialog: #1e1e1e;
          --bg-color-header-tab-inactive-hover: #292929;
          --border-color-header-tab-active: #4d4d4d;
          --bg-color-header-tab-active: #2a2a2a;
        }
      `}
    </style>
  );
};

export default function CohereDocs({
  header,
  sidebar,
  children,
  announcement,
  tabs,
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

  const mainRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const setScrollBody = useSetAtom(SCROLL_BODY_ATOM);
  useEffect(() => {
    setScrollBody(scrollAreaRef.current);
  }, [setScrollBody]);

  const pathname = useCurrentPathname();
  useEffect(() => {
    scrollAreaRef.current?.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="fixed inset-0 flex flex-col">
      <CohereDocsStyle />
      {announcement}
      {/* <HeaderContainer header={header} tabs={tabs} /> */}
      <div className="width-before-scroll-bar flex min-h-0 flex-1 shrink flex-col gap-3 p-3">
        <FernHeader
          className={cn(
            "flex flex-col gap-3",
            { "lg:hidden": isHeaderDisabled },
            headerClassName
          )}
          data-theme="cohere"
        >
          <div className="border-border-default rounded-2 bg-header-background h-(--header-height-real) flex items-center overflow-clip border px-4">
            {header}
          </div>
          <HeaderTabsRoot
            showSearchBar={showSearchBarInTabs}
            className="bg-header-background border-border-default rounded-2 overflow-clip border p-3"
          >
            {tabs}
          </HeaderTabsRoot>
        </FernHeader>
        <MainCtx.Provider value={mainRef}>
          <main
            ref={mainRef}
            className="flex min-h-0 flex-1 shrink gap-3"
            data-theme="cohere"
          >
            <SidebarNav className={sidebarClassName} data-theme="cohere">
              {sidebar}
            </SidebarNav>
            <div className="bg-sidebar-background border-border-default rounded-2 min-w-0 flex-1 shrink overflow-clip border">
              <FernScrollArea
                ref={scrollAreaRef}
                scrollbars="vertical"
                className="scroll-pt-4"
              >
                <div id="fern-cohere-content">{children}</div>

                {/* Enables footer DOM injection */}
                <footer id="fern-footer" />
              </FernScrollArea>
            </div>
          </main>
        </MainCtx.Provider>
      </div>
    </div>
  );
}
