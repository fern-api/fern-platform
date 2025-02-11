import { ReactElement, useEffect, useRef, useState } from "react";

import { clsx } from "clsx";
import { useAtomValue } from "jotai";

import { DEFAULT_HEADER_HEIGHT } from "@fern-docs/utils";

import {
  HAS_HORIZONTAL_TABS,
  MOBILE_SIDEBAR_ENABLED_ATOM,
  useColors,
  useIsMobileSidebarOpen,
} from "../../atoms";
import { BgImageGradient } from "../../components/BgImageGradient";
import { Announcement } from "../../header/Announcement";
import { Header } from "../../header/Header";
import { HeaderTabs } from "../../header/HeaderTabs";
import { useIsScrolled } from "../../hooks/useIsScrolled";
import { FernHeader } from "./fern-header";

interface HeaderContainerProps {
  className?: string;
}

export function HeaderContainer({
  className,
  hasBackgroundLight,
  hasBackgroundDark,
}: {
  className?: string;
  hasBackgroundLight: boolean;
  hasBackgroundDark: boolean;
}): ReactElement<any> {
  const showHeaderTabs = useAtomValue(HAS_HORIZONTAL_TABS);
  const isScrolled = useIsScrolled();
  const isMobileSidebarEnabled = useAtomValue(MOBILE_SIDEBAR_ENABLED_ATOM);
  const isMobileSidebarOpen = useIsMobileSidebarOpen();

  return (
    <FernHeader className={className} defaultHeight={DEFAULT_HEADER_HEIGHT}>
      <Announcement />
      <div
        className={clsx("fern-header-container width-before-scroll-bar", {
          "has-background-light": hasBackgroundLight,
          "has-background-dark": hasBackgroundDark,
        })}
        data-border={
          isScrolled || (isMobileSidebarOpen && isMobileSidebarEnabled)
            ? "show"
            : "hide"
        }
      >
        <div className="clipped-background">
          <BgImageGradient className="h-screen opacity-60 dark:opacity-80" />
        </div>
        <div className="fern-header">
          <Header className="max-w-page-width mx-auto" />
        </div>
        {showHeaderTabs && (
          <nav aria-label="tabs" className="fern-header-tabs">
            <HeaderTabs />
          </nav>
        )}
      </div>
    </FernHeader>
  );
}
