import SearchIcon from "@mui/icons-material/Search";
import cn from "clsx";
import { memo, type MouseEventHandler } from "react";
import { useSearchService } from "../services/useSearchService";

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
                <SearchIcon className="size-6 mr-2 -my-0.5" />
                <span>Search</span>
            </span>

            <span className="keyboard-shortcut-hint">{"/"}</span>
        </button>
    );
});
