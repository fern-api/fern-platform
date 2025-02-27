"use client";

import React from "react";

import { FernScrollArea } from "@fern-docs/components";

import { useDismountMeasureSidebarScrollPosition } from "@/state/sidebar-scroll";

import { useIsScrolled } from "../hooks/useIsScrolled";
import { MobileSidebarHeaderLinks } from "./MobileSidebarHeaderLinks";
import { SidebarFixedItemsSection } from "./SidebarFixedItemsSection";
import { ThemeSwitch } from "./theme-switch";

export const SidebarContainer = React.memo(function SidebarContainer({
  logo,
  versionSelect,
  navbarLinks,
  loginButton,
  children,
  showSearchBar,
  showHeaderInSidebar,
}: {
  showSearchBar: boolean;
  showHeaderInSidebar: boolean;
  logo: React.ReactNode;
  versionSelect: React.ReactNode;
  navbarLinks: React.ReactNode;
  loginButton: React.ReactNode;
  children: React.ReactNode;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const isScrolled = useIsScrolled(ref);
  useDismountMeasureSidebarScrollPosition(ref);

  return (
    <>
      <SidebarFixedItemsSection
        logo={logo}
        versionSelect={versionSelect}
        showBorder={isScrolled}
        showSearchBar={showSearchBar}
        showHeaderInSidebar={showHeaderInSidebar}
      />
      <FernScrollArea
        id="sidebar-scroll-area"
        rootClassName="flex-1"
        className="group/sidebar mask-grad-y-3 overscroll-contain px-4 py-3 pb-12 lg:pl-5 [&>div]:space-y-6"
        scrollbars="vertical"
        ref={ref}
      >
        {loginButton}
        {children}
        <MobileSidebarHeaderLinks>{navbarLinks}</MobileSidebarHeaderLinks>
        <ThemeSwitch className="mx-auto mt-8 flex" />
      </FernScrollArea>
    </>
  );
});
