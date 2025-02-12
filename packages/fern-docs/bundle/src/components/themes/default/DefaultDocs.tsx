"use client";

import { ColorsThemeConfig } from "@/server/types";

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
  // const isSidebarDismissable = useAtomValue(SIDEBAR_DISMISSABLE_ATOM);

  return (
    <div id="fern-docs" className="fern-container fern-theme-default">
      <HeaderContainer
        header={header}
        announcement={announcement}
        showHeader
        showHeaderTabs
        colors={colors}
      />

      <div className="fern-body">
        <nav className="w-sidebar-width sticky top-[var(--header-height)] mt-[var(--header-height)] flex h-fit max-h-[calc(100dvh-var(--header-height))] flex-col">
          {sidebar}
        </nav>
        <main className="mt-[var(--header-height)] flex-1">{children}</main>
      </div>

      {/* Enables footer DOM injection */}
      <footer id="fern-footer" />
    </div>
  );
}

export default DefaultDocs;
