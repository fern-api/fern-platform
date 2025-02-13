import { useMemo } from "react";

import cn from "clsx";

import { useThemeSwitchEnabled } from "@/hooks/use-theme";
import { SearchV2Trigger } from "@/state/search";

import { HeaderLogoSection } from "../header/HeaderLogoSection";
import { ThemeButton } from "../themes";

export declare namespace SidebarFixedItemsSection {
  export interface Props {
    logo: React.ReactNode;
    versionSelect: React.ReactNode;
    className?: string;
    showBorder?: boolean;
    currentTabIndex?: number | undefined;
  }
}

export const SidebarFixedItemsSection: React.FC<
  SidebarFixedItemsSection.Props
> = ({ logo, versionSelect, className, showBorder }) => {
  const showSearchBar = false;
  const themeSwitchEnabled = useThemeSwitchEnabled();
  const layout = {
    disableHeader: false,
  };

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
      <HeaderLogoSection logo={logo} versionSelect={versionSelect} />
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
