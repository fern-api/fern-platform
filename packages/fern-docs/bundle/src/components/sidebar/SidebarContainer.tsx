"use client";

import { ComponentPropsWithoutRef, forwardRef, memo } from "react";

import clsx from "clsx";
import { useAtom, useAtomValue } from "jotai";

import { FernScrollArea, FernTooltipProvider } from "@fern-docs/components";

import {
  CURRENT_TAB_INDEX_ATOM,
  DOCS_LAYOUT_ATOM,
  MOBILE_SIDEBAR_ENABLED_ATOM,
  type NavbarLink,
  SIDEBAR_SCROLL_CONTAINER_ATOM,
  TABS_ATOM,
  useInitSidebarExpandedNodes,
  useIsMobileSidebarOpen,
} from "../atoms";
import { useIsScrolled } from "../hooks/useIsScrolled";
import { MobileSidebarHeaderLinks } from "./MobileSidebarHeaderLinks";
import { SidebarFixedItemsSection } from "./SidebarFixedItemsSection";
import { SidebarTabButton } from "./SidebarTabButton";

interface SidebarContainerProps extends ComponentPropsWithoutRef<"nav"> {
  logo: React.ReactNode;
  versionSelect: React.ReactNode;
  navbarLinks: NavbarLink[];
}

const UnmemoizedSidebarContainer = forwardRef<
  HTMLElement,
  SidebarContainerProps
>(function DesktopSidebar(
  { logo, versionSelect, navbarLinks, children, ...props },
  ref
) {
  const layout = useAtomValue(DOCS_LAYOUT_ATOM);
  const tabs = useAtomValue(TABS_ATOM);
  const currentTabIndex = useAtomValue(CURRENT_TAB_INDEX_ATOM);
  const [scrollRef, setScrollRef] = useAtom(SIDEBAR_SCROLL_CONTAINER_ATOM);
  const isScrolled = useIsScrolled({ current: scrollRef });
  const isMobileSidebarEnabled = useAtomValue(MOBILE_SIDEBAR_ENABLED_ATOM);
  const isMobileSidebarOpen = useIsMobileSidebarOpen();
  useInitSidebarExpandedNodes();

  return (
    <nav
      aria-label="secondary"
      ref={ref}
      {...props}
      className={clsx("fern-sidebar-container", props.className)}
    >
      <SidebarFixedItemsSection
        logo={logo}
        versionSelect={versionSelect}
        showBorder={
          isScrolled || (isMobileSidebarOpen && isMobileSidebarEnabled)
        }
      />
      <FernScrollArea
        rootClassName="flex-1"
        className={clsx(
          "group/sidebar fern-sidebar-content overscroll-contain"
        )}
        scrollbars="vertical"
        ref={setScrollRef}
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
    </nav>
  );
});

export const SidebarContainer = memo(UnmemoizedSidebarContainer);
