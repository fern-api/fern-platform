"use client";

import React from "react";

import clsx from "clsx";
import { useAtomValue } from "jotai";

import { FernScrollArea, FernTooltipProvider, cn } from "@fern-docs/components";

import {
  CURRENT_TAB_INDEX_ATOM,
  DOCS_LAYOUT_ATOM,
  type NavbarLink,
  TABS_ATOM,
} from "../atoms";
import { useIsScrolled } from "../hooks/useIsScrolled";
import { MobileSidebarHeaderLinks } from "./MobileSidebarHeaderLinks";
import { SidebarFixedItemsSection } from "./SidebarFixedItemsSection";
import { SidebarTabButton } from "./SidebarTabButton";

export const SidebarContainer = React.memo(function SidebarContainer({
  logo,
  versionSelect,
  navbarLinks,
  children,
}: {
  logo: React.ReactNode;
  versionSelect: React.ReactNode;
  navbarLinks: NavbarLink[];
  children: React.ReactNode;
}) {
  const layout = useAtomValue(DOCS_LAYOUT_ATOM);
  const tabs = useAtomValue(TABS_ATOM);
  const currentTabIndex = useAtomValue(CURRENT_TAB_INDEX_ATOM);
  const ref = React.useRef<HTMLDivElement>(null);
  const isScrolled = useIsScrolled(ref);
  // const isMobileSidebarEnabled = useAtomValue(MOBILE_SIDEBAR_ENABLED_ATOM);
  // const isMobileSidebarOpen = useIsMobileSidebarOpen();

  return (
    <>
      <SidebarFixedItemsSection
        logo={logo}
        versionSelect={versionSelect}
        showBorder={isScrolled}
      />
      <FernScrollArea
        rootClassName="flex-1"
        className={cn("group/sidebar overscroll-contain px-4 lg:pl-5")}
        scrollbars="vertical"
        ref={ref}
      >
        {tabs.length > 0 && (
          <ul
            className={clsx("fern-sidebar-tabs", {
              "lg:hidden":
                layout?.disableHeader !== true &&
                layout?.tabsPlacement === "HEADER",
            })}
          >
            {tabs.map((tab, idx) => (
              <SidebarTabButton
                key={idx}
                tab={tab}
                selected={tab.index === currentTabIndex}
              />
            ))}
          </ul>
        )}
        <FernTooltipProvider>{children}</FernTooltipProvider>
        <MobileSidebarHeaderLinks navbarLinks={navbarLinks} />
      </FernScrollArea>
    </>
  );
});
