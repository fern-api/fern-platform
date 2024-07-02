import { useEventCallback } from "@fern-ui/react-commons";
import { MagnifyingGlassIcon } from "@radix-ui/react-icons";
import cn from "clsx";
import { useSetAtom } from "jotai";
import { memo } from "react";
import { useOpenSearchDialog } from "../atoms/sidebar";
import { INKEEP_TRIGGER } from "../search/inkeep/InkeepCustomTrigger";
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
    const openInkeepCustomTrigger = useSetAtom(INKEEP_TRIGGER);
    const [searchService] = useSearchConfig();

    const handleClick = useEventCallback(() => {
        if (searchService.isAvailable && searchService.type === "inkeep") {
            openInkeepCustomTrigger(true);
        } else {
            openSearchDialog();
        }
    });

    return (
        <button
            onClick={handleClick}
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
