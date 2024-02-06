import classNames from "classnames";
import { memo, type MouseEventHandler } from "react";
import { SearchIcon } from "../commons/icons/SearchIcon";
import "./SidebarSearchBar.scss";

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
    return (
        <button onClick={onClick} className={classNames(className, "fern-search-bar")}>
            <span className="search-placeholder">
                <SearchIcon className="h-5 w-5" />
                <span>Search...</span>
            </span>

            <span className="keyboard-shortcut-hint">{"/"}</span>
        </button>
    );
});
