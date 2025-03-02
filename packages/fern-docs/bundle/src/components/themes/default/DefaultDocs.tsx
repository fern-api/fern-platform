"use client";

import React from "react";

import { cn } from "@fern-docs/components";

import { BgImageGradient } from "@/components/BgImageGradient";
import { HeaderTabsRoot } from "@/components/header/HeaderTabsRoot";
import { SetIsSidebarFixed, useShouldHideAsides } from "@/state/layout";

import { FernHeader } from "./fern-header";
import { MainCtx } from "./mobile-menu";
import { SideNav } from "./side-nav";

export default function DefaultDocs({
  header,
  sidebar,
  children,
  announcement,
  tabs,
  isSidebarFixed = false,
  isHeaderDisabled = false,
}: {
  header: React.ReactNode;
  sidebar: React.ReactNode;
  children: React.ReactNode;
  announcement?: React.ReactNode;
  tabs?: React.ReactNode;
  isSidebarFixed?: boolean;
  isHeaderDisabled?: boolean;
}) {
  const mainRef = React.useRef<HTMLDivElement>(null);
  const hideAsides = useShouldHideAsides();
  return (
    <>
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
        <HeaderTabsRoot>{tabs}</HeaderTabsRoot>
      </FernHeader>

      <MainCtx.Provider value={mainRef}>
        <main ref={mainRef} className="mt-(--header-height) relative z-0">
          <div
            className={cn("max-w-page-width-padded mx-auto flex flex-row", {
              "[&>aside]:lg:hidden": hideAsides,
            })}
          >
            <SideNav fixed={isSidebarFixed}>{sidebar}</SideNav>
            {children}
          </div>
        </main>
      </MainCtx.Provider>

      {/* Enables footer DOM injection */}
      <footer id="fern-footer" />
    </>
  );
}
