"use client";

import React from "react";

import { FernScrollArea, cn } from "@fern-docs/components";

import { useIsScrolled } from "../hooks/useIsScrolled";
import { MobileSidebarHeaderLinks } from "./MobileSidebarHeaderLinks";
import { SidebarFixedItemsSection } from "./SidebarFixedItemsSection";

export const SidebarContainer = React.memo(function SidebarContainer({
  tabs,
  logo,
  versionSelect,
  navbarLinks,
  loginButton,
  children,
}: {
  tabs: React.ReactNode;
  logo: React.ReactNode;
  versionSelect: React.ReactNode;
  navbarLinks: React.ReactNode;
  loginButton: React.ReactNode;
  children: React.ReactNode;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const isScrolled = useIsScrolled(ref);

  return (
    <>
      {false && (
        <SidebarFixedItemsSection
          logo={logo}
          versionSelect={versionSelect}
          showBorder={isScrolled}
        />
      )}
      <FernScrollArea
        rootClassName="flex-1"
        className={cn("group/sidebar overscroll-contain px-4 pb-12 lg:pl-5")}
        scrollbars="vertical"
        ref={ref}
      >
        {loginButton}
        {tabs}
        {children}
        <MobileSidebarHeaderLinks>{navbarLinks}</MobileSidebarHeaderLinks>
      </FernScrollArea>
    </>
  );
});
