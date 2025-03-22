"use client";

import { CSSProperties } from "react";
import React from "react";

import { FernButtonGroup, cn } from "@fern-docs/components";
import { useIsDesktop } from "@fern-ui/react-commons";

import { SearchV2Trigger } from "@/state/search";

import { ThemeSwitch } from "../sidebar/theme-switch";
import { MobileMenuButton } from "./MobileButtons";

export function HeaderContent({
  logo,
  versionSelect,
  productSelect,
  className,
  style,
  showSearchBar,
  navbarLinks,
  loginButton,
}: {
  logo: React.ReactNode;
  versionSelect: React.ReactNode;
  productSelect: React.ReactNode;
  className?: string;
  style?: CSSProperties;
  showSearchBar?: boolean;
  navbarLinks: React.ReactNode;
  loginButton?: React.ReactNode;
}) {
  const isSmallScreen = !useIsDesktop();
  return (
    <div
      className={cn(
        "flex w-full items-center justify-stretch gap-4",
        className
      )}
      style={style}
    >
      <div className="fern-header-logo-container">
        <div className="flex items-center gap-2">
          <div className="flex items-start gap-2">
            {logo}
            {productSelect}
          </div>
          {versionSelect}
        </div>
      </div>

      {(showSearchBar || isSmallScreen) && (
        <SearchV2Trigger
          aria-label="Search"
          className="fern-header-search-bar"
        />
      )}

      <FernButtonGroup asChild>
        <nav className="fern-header-navbar-links" aria-label="Navbar links">
          {navbarLinks}
          {loginButton}
          <ThemeSwitch iconOnly variant="ghost" className="ml-2" />
        </nav>
      </FernButtonGroup>

      <div className="fern-header-mobile-menu-button">
        <MobileMenuButton />
      </div>
    </div>
  );
}
