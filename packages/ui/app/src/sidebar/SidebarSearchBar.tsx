import cn from "clsx";
import { Search } from "iconoir-react";
import { memo } from "react";
import { useOpenSearchDialog } from "../atoms";
import { useSearchConfig } from "../services/useSearchService";

export declare namespace SidebarSearchBar {
    export interface Props {
        className?: string;
        hideKeyboardShortcutHint?: boolean;
    }
}

export const SidebarSearchBar: React.FC<SidebarSearchBar.Props> = memo(function UnmemoizedSidebarSearchBar({
    className,
    hideKeyboardShortcutHint,
}) {
    const openSearchDialog = useOpenSearchDialog();
    const searchService = useSearchConfig();

    return (
        <button
            id="fern-search-button"
            onClick={openSearchDialog}
            className={cn("fern-search-bar", className)}
            disabled={!searchService.isAvailable}
        >
            <span className="search-placeholder">
                <Search className="size-icon-md" />
                <span>Search...</span>
            </span>

            {!hideKeyboardShortcutHint && <kbd className="keyboard-shortcut-hint">{"/"}</kbd>}
        </button>
    );
});
