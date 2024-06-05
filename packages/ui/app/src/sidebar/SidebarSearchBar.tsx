import { MagnifyingGlassIcon } from "@radix-ui/react-icons";
import cn from "clsx";
import { memo, type MouseEventHandler } from "react";
import { useSearchService } from "../services/useSearchService.js";

export declare namespace SidebarSearchBar {
    export interface Props {
        onClick: MouseEventHandler<HTMLButtonElement>;
        className?: string;
    }
}

export const SidebarSearchBar: React.FC<SidebarSearchBar.Props> = memo(function UnmemoizedSidebarSearchBar({
    onClick,
    className,
}) {
    const searchService = useSearchService();
    return (
        <button onClick={onClick} className={cn("fern-search-bar", className)} disabled={!searchService.isAvailable}>
            <span className="search-placeholder">
                <MagnifyingGlassIcon className="size-5" />
                <span>Search...</span>
            </span>

            <span className="keyboard-shortcut-hint">{"/"}</span>
        </button>
    );
});
