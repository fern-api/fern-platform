"use client";

import * as Tabs from "@radix-ui/react-tabs";

import { cn } from "@fern-docs/components";

import { useCurrentTabId } from "@/state/navigation";
import { SearchV2Trigger } from "@/state/search";

export function HeaderTabsRoot({
  children,
  showSearchBar,
  className,
}: {
  children: React.ReactNode;
  showSearchBar: boolean;
  className?: string;
}) {
  const currentTabId = useCurrentTabId();
  return (
    <Tabs.Root
      value={currentTabId}
      className={cn("fern-header-tabs", className)}
    >
      {children}
      {showSearchBar && (
        <SearchV2Trigger aria-label="Search" className="max-w-sidebar-width" />
      )}
    </Tabs.Root>
  );
}
