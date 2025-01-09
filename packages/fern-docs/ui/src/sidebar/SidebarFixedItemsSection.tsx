import cn from "clsx";
import { useAtomValue } from "jotai";
import { useMemo } from "react";
import {
  DOCS_LAYOUT_ATOM,
  PAGE_HAS_SEARCHBAR_ATOM,
  SEARCHBAR_PLACEMENT_ATOM,
  THEME_SWITCH_ENABLED_ATOM,
} from "../atoms";
import { HeaderLogoSection } from "../header/HeaderLogoSection";
import { ThemeButton } from "../themes";
import { SidebarSearchBar } from "./SidebarSearchBar";

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
  const pageHasSearchBar = useAtomValue(PAGE_HAS_SEARCHBAR_ATOM);
  const showSearchBar =
    useAtomValue(SEARCHBAR_PLACEMENT_ATOM) === "SIDEBAR" && !pageHasSearchBar;
  const themeSwitchEnabled = useAtomValue(THEME_SWITCH_ENABLED_ATOM);
  const layout = useAtomValue(DOCS_LAYOUT_ATOM);

  const searchBar = useMemo(() => {
    return showSearchBar ? (
      <div className="fern-sidebar-searchbar-container">
        <SidebarSearchBar className="w-full" />
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
