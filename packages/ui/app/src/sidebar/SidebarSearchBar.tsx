import { MagnifyingGlassIcon } from "@radix-ui/react-icons";
import classNames from "classnames";
import { memo, type MouseEventHandler } from "react";
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
        <button onClick={onClick} className={classNames("fern-search-bar", className)}>
            <span className="search-placeholder">
                <MagnifyingGlassIcon className="size-5" />
                <span>Search...</span>
            </span>

            <span className="keyboard-shortcut-hint">{"/"}</span>
        </button>
    );
});
