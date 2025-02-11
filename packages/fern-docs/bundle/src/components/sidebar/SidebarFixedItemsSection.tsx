import { useMemo } from "react";

import cn from "clsx";
import { useAtomValue } from "jotai";

import { SearchV2Trigger } from "@/components/search-trigger";
import { useThemeSwitchEnabled } from "@/hooks/theme-switch";

import { DOCS_LAYOUT_ATOM, SEARCHBAR_PLACEMENT_ATOM } from "../atoms";
import { HeaderLogoSection } from "../header/HeaderLogoSection";
import { ThemeButton } from "../themes";

export declare namespace SidebarFixedItemsSection {
  export interface Props {
    className?: string;
    showBorder?: boolean;
    currentTabIndex?: number | undefined;
  }
}

export const SidebarFixedItemsSection: React.FC<
  SidebarFixedItemsSection.Props
> = ({ className, showBorder }) => {
  const showSearchBar = useAtomValue(SEARCHBAR_PLACEMENT_ATOM) === "SIDEBAR";
  const themeSwitchEnabled = useThemeSwitchEnabled();
  const layout = useAtomValue(DOCS_LAYOUT_ATOM);

  const searchBar = useMemo(() => {
    return showSearchBar ? (
      <div className="fern-sidebar-searchbar-container">
        <SearchV2Trigger />
      </div>
    ) : null;
  }, [showSearchBar]);

  if (!showSearchBar) {
    return null;
  }

  const header = layout?.disableHeader && (
    <div className="fern-sidebar-header">
      <HeaderLogoSection />
      <div className="-mr-3">
        {themeSwitchEnabled && <ThemeButton size="large" />}
      </div>
    </div>
  );

  return (
    <div
      className={cn("flex flex-col px-4", { "lg:pt-4": !header }, className)}
      data-border={showBorder ? "show" : "hide"}
    >
      {header}
      {searchBar}
    </div>
  );
};
