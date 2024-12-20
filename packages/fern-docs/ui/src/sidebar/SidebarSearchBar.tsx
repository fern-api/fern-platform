import { memo } from "react";

import { DesktopSearchButton } from "@fern-docs/search-ui";
import clsx from "clsx";
import { Search } from "iconoir-react";
import dynamic from "next/dynamic";
import { useFeatureFlag, useOpenSearchDialog } from "../atoms";
import { useSearchConfig } from "../services/useSearchService";

const SearchV2 = dynamic(
  () => import("../search/SearchV2").then((mod) => mod.SearchV2),
  {
    ssr: false,
    loading: () => <DesktopSearchButton variant="loading" />,
  }
);

export declare namespace SidebarSearchBar {
  export interface Props {
    className?: string;
    hideKeyboardShortcutHint?: boolean;
  }
}

export const SidebarSearchBar: React.FC<SidebarSearchBar.Props> = memo(
  function UnmemoizedSidebarSearchBar({ className, hideKeyboardShortcutHint }) {
    const isSearchV2Enabled = useFeatureFlag("isSearchV2Enabled");
    if (!isSearchV2Enabled) {
      return (
        <SidebarSearchBarV1
          className={className}
          hideKeyboardShortcutHint={hideKeyboardShortcutHint}
        />
      );
    }
    return <SearchV2 />;
  }
);

export const SidebarSearchBarV1: React.FC<SidebarSearchBar.Props> = memo(
  function UnmemoizedSidebarSearchBar({ className, hideKeyboardShortcutHint }) {
    const openSearchDialog = useOpenSearchDialog();
    const searchService = useSearchConfig();

    return (
      <button
        id="fern-search-button"
        onClick={openSearchDialog}
        className={clsx("fern-search-bar", className)}
        disabled={!searchService.isAvailable}
      >
        <span className="search-placeholder">
          <Search className="size-icon-md" />
          <span>Search...</span>
        </span>

        {!hideKeyboardShortcutHint && (
          <kbd className="keyboard-shortcut-hint">{"/"}</kbd>
        )}
      </button>
    );
  }
);
