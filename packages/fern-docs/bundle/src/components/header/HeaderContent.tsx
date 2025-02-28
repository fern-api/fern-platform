"use client";

import { CSSProperties } from "react";
import React from "react";

import { FernButtonGroup, cn } from "@fern-docs/components";
import { useIsMobile } from "@fern-ui/react-commons";

import { SearchV2Trigger } from "@/state/search";

import { MobileMenuButton } from "./MobileButtons";

export function HeaderContent({
  logo,
  versionSelect,
  className,
  style,
  showSearchBar,
  navbarLinks,
  loginButton,
}: {
  logo: React.ReactNode;
  versionSelect: React.ReactNode;
  className?: string;
  style?: CSSProperties;
  showSearchBar?: boolean;
  navbarLinks: React.ReactNode;
  loginButton?: React.ReactNode;
}) {
  const isMobile = useIsMobile();
  return (
    <div
      className={cn(
        "flex w-full items-center justify-stretch gap-4",
        className
      )}
      style={style}
    >
      <div className="relative flex h-full min-w-fit flex-1 shrink-0 items-center gap-2 py-1">
        <div className="flex items-center gap-2">
          {logo}
          {versionSelect}
        </div>
      </div>

      {(showSearchBar || isMobile) && (
        <SearchV2Trigger
          aria-label="Search"
          className="max-w-content-width hidden w-full min-w-0 shrink lg:inline-flex"
        />
      )}

      <FernButtonGroup asChild>
        <nav
          aria-label="Navbar links"
          className="hidden flex-1 lg:flex lg:items-center lg:justify-end"
        >
          {navbarLinks}
          {loginButton}
        </nav>
      </FernButtonGroup>

      <div className="flex flex-1 items-center justify-end lg:hidden">
        <MobileMenuButton className="-mx-2" />
      </div>
    </div>
  );
}
