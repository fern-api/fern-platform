"use client";

import React from "react";

import { FernScrollArea, FernTooltipProvider, cn } from "@fern-docs/components";

import { useCurrentTab, useTabs } from "@/state/navigation";

import { type NavbarLink } from "../atoms";
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
  // const layout = useAtomValue(DOCS_LAYOUT_ATOM);
  const tabs = useTabs();
  const currentTab = useCurrentTab();
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
        className={cn("group/sidebar overscroll-contain px-4 pb-12 lg:pl-5")}
        scrollbars="vertical"
        ref={ref}
      >
        {tabs.length > 0 && (
          <ul
            className={cn("fern-sidebar-tabs", {
              "lg:hidden": true,
            })}
          >
            {tabs.map((tab, idx) => (
              <SidebarTabButton
                key={idx}
                tab={tab}
                selected={tab.id === currentTab?.id}
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
