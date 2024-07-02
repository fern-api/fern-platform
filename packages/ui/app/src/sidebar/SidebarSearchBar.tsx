import { MagnifyingGlassIcon } from "@radix-ui/react-icons";
import cn from "clsx";
import { memo } from "react";
import { useOpenSearchDialog } from "../atoms/sidebar";
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
    const [searchService] = useSearchConfig();

    return (
        <button
            onClick={openSearchDialog}
            className={cn("fern-search-bar", className)}
            disabled={!searchService.isAvailable}
        >
            <span className="search-placeholder">
                <MagnifyingGlassIcon className="size-5" />
                <span>Search...</span>
            </span>

            {!hideKeyboardShortcutHint && <kbd className="keyboard-shortcut-hint">{"/"}</kbd>}
        </button>
    );
});
