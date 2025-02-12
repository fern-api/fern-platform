"use client";

import { ReactElement } from "react";

import { cn } from "@fern-docs/components";
import { DEFAULT_HEADER_HEIGHT } from "@fern-docs/utils";

import { BgImageGradient } from "@/components/components/BgImageGradient";
import { HeaderTabs } from "@/components/header/HeaderTabs";
import { useIsScrolled } from "@/components/hooks/useIsScrolled";
import { ColorsThemeConfig } from "@/server/types";

import { FernHeader } from "./fern-header";

export function HeaderContainer({
  header,
  announcement,
  className,
  hasBackgroundLight,
  hasBackgroundDark,
  showHeader,
  showHeaderTabs,
  colors,
}: {
  header: React.ReactNode;
  announcement?: React.ReactNode;
  className?: string;
  hasBackgroundLight?: boolean;
  hasBackgroundDark?: boolean;
  showHeader?: boolean;
  showHeaderTabs?: boolean;
  colors: {
    light?: ColorsThemeConfig;
    dark?: ColorsThemeConfig;
  };
}): ReactElement<any> {
  const isScrolled = useIsScrolled();
  // const isMobileSidebarEnabled = useAtomValue(MOBILE_SIDEBAR_ENABLED_ATOM);
  // const isMobileSidebarOpen = useIsMobileSidebarOpen();

  return (
    <FernHeader className={className} defaultHeight={DEFAULT_HEADER_HEIGHT}>
      {announcement}
      {showHeader && (
        <div
          className={cn("fern-header-container width-before-scroll-bar", {
            "has-background-light": hasBackgroundLight,
            "has-background-dark": hasBackgroundDark,
          })}
          data-border={isScrolled ? "show" : "hide"}
        >
          <div className="clipped-background">
            <BgImageGradient
              className="h-screen opacity-60 dark:opacity-80"
              colors={colors}
            />
          </div>
          <div className="fern-header">{header}</div>
          {showHeaderTabs && (
            <nav aria-label="tabs" className="fern-header-tabs">
              <HeaderTabs />
            </nav>
          )}
        </div>
      )}
    </FernHeader>
  );
}
