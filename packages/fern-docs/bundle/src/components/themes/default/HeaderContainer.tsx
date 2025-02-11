import { ReactElement } from "react";

import { useAtomValue } from "jotai";

import { cn } from "@fern-docs/components";
import { DEFAULT_HEADER_HEIGHT } from "@fern-docs/utils";

import {
  MOBILE_SIDEBAR_ENABLED_ATOM,
  useIsMobileSidebarOpen,
} from "@/components/atoms";
import { BgImageGradient } from "@/components/components/BgImageGradient";
import { Header } from "@/components/header/Header";
import { HeaderTabs } from "@/components/header/HeaderTabs";
import { useIsScrolled } from "@/components/hooks/useIsScrolled";

import { FernHeader } from "./fern-header";

export function HeaderContainer({
  announcement,
  className,
  hasBackgroundLight,
  hasBackgroundDark,
  showHeader,
  showHeaderTabs,
}: {
  announcement?: React.ReactNode;
  className?: string;
  hasBackgroundLight?: boolean;
  hasBackgroundDark?: boolean;
  showHeader?: boolean;
  showHeaderTabs?: boolean;
}): ReactElement<any> {
  const isScrolled = useIsScrolled();
  const isMobileSidebarEnabled = useAtomValue(MOBILE_SIDEBAR_ENABLED_ATOM);
  const isMobileSidebarOpen = useIsMobileSidebarOpen();

  return (
    <FernHeader className={className} defaultHeight={DEFAULT_HEADER_HEIGHT}>
      {announcement}
      {showHeader && (
        <div
          className={cn("fern-header-container width-before-scroll-bar", {
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
      )}
    </FernHeader>
  );
}
