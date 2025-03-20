"use client";

import React from "react";

import { FernScrollArea, cn } from "@fern-docs/components";

import { useDismountMeasureSidebarScrollPosition } from "@/state/sidebar-scroll";

import { FERN_SIDEBAR_SCROLL_AREA_ID } from "../constants";
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
  useDismountMeasureSidebarScrollPosition(ref);

  return (
    <>
      <SidebarFixedItemsSection
        logo={logo}
        versionSelect={versionSelect}
        showSearchBar={showSearchBar}
        showHeaderInSidebar={showHeaderInSidebar}
      />
      <FernScrollArea
        id={FERN_SIDEBAR_SCROLL_AREA_ID}
        rootClassName="flex-1"
        className="group/sidebar mask-grad-y-3 sticky overscroll-contain [&>div]:space-y-6"
        scrollbars="vertical"
        ref={ref}
      >
        {loginButton}
        {children}
        <MobileSidebarHeaderLinks hideInDesktop={!showHeaderInSidebar}>
          {navbarLinks}
        </MobileSidebarHeaderLinks>
        <ThemeSwitch
          className={cn(
            "mx-auto mt-8 flex",
            !showHeaderInSidebar && "lg:hidden"
          )}
        />
      </FernScrollArea>
    </>
  );
});
