"use client";

import { cn } from "@fern-docs/components";
import { useIsMobile } from "@fern-ui/react-commons";

import { SearchV2Trigger } from "@/state/search";

export function SidebarFixedItemsSection({
  logo,
  versionSelect,
  className,
  showBorder,
  showSearchBar,
  showHeaderInSidebar,
}: {
  logo: React.ReactNode;
  versionSelect: React.ReactNode;
  showBorder?: boolean;
  showSearchBar?: boolean;
  showHeaderInSidebar?: boolean;
  className?: string;
}) {
  const isMobile = useIsMobile();
  if (!showHeaderInSidebar && !showSearchBar && !isMobile) {
    return null;
  }
  return (
    <div
      className={cn(
        "flex flex-col border-b px-4 lg:pl-5",
        showBorder ? "border-border-default" : "border-transparent",
        className
      )}
    >
      {showHeaderInSidebar && (
        <div className="fern-sidebar-header">
          <div className="relative flex h-full min-w-fit flex-1 shrink-0 items-center gap-2 py-1">
            <div className="flex items-center gap-2">
              {logo}
              {versionSelect}
            </div>
          </div>
        </div>
      )}

      {showSearchBar && (
        <SearchV2Trigger aria-label="Search" className="my-3 w-full lg:my-2" />
      )}
    </div>
  );
}
