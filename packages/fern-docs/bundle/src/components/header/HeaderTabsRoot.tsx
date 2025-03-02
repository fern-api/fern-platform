"use client";

import * as Tabs from "@radix-ui/react-tabs";

import { useCurrentTabId } from "@/state/navigation";
import { SearchV2Trigger } from "@/state/search";

export function HeaderTabsRoot({
  children,
  showSearchBar,
}: {
  children: React.ReactNode;
  showSearchBar: boolean;
}) {
  const currentTabId = useCurrentTabId();
  return (
    <Tabs.Root
      value={currentTabId}
      className="w-page-width-padded px-page-padding mx-auto hidden max-w-full select-none lg:flex lg:justify-between"
    >
      {children}
      {showSearchBar && (
        <SearchV2Trigger aria-label="Search" className="max-w-sidebar-width" />
      )}
    </Tabs.Root>
  );
}
