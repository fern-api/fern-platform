"use client";

import { cn } from "@fern-docs/components";

import { ColorsThemeConfig } from "@/server/types";
import { useLayout } from "@/state/layout";

import { HeaderContainer } from "./HeaderContainer";

export function DefaultDocs({
  header,
  sidebar,
  children,
  announcement,
  colors,
}: {
  header: React.ReactNode;
  sidebar: React.ReactNode;
  children: React.ReactNode;
  announcement?: React.ReactNode;
  colors: {
    light?: ColorsThemeConfig;
    dark?: ColorsThemeConfig;
  };
}) {
  const layout = useLayout();
  return (
    <div id="fern-docs" className="fern-container fern-theme-default">
      <HeaderContainer
        className="z-30"
        header={header}
        announcement={announcement}
        showHeader
        showHeaderTabs
        colors={colors}
      />

      {layout === "custom" ? (
        children
      ) : (
        <div className="fern-body z-0">
          <nav
            className={cn(
              "w-sidebar-width sticky top-[var(--header-height)] z-30 mt-[var(--header-height)] flex h-fit max-h-[calc(100dvh-var(--header-height))] shrink-0 flex-col pl-1",
              { hidden: layout === "page" }
            )}
          >
            {sidebar}
          </nav>
          <main className="mt-[var(--header-height)] min-w-0 flex-1 shrink">
            {children}
          </main>
        </div>
      )}

      {/* Enables footer DOM injection */}
      <footer id="fern-footer" />
    </div>
  );
}

export default DefaultDocs;
