import { Icon } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import classNames from "classnames";
import { ReactElement } from "react";

type SearchProps = {
    searchInput: string;
    handleSearchInput: (value: string) => void;
    border?: boolean; //This is used to display a rounded border
    clear?: boolean; //This will show/hide the default search input clear (X) button
};

export const SearchInput = ({
    searchInput,
    handleSearchInput,
    border = true,
    clear = true,
}: SearchProps): ReactElement => {
    return (
        <div
            className={classNames("border-default rounded-md w-full flex gap-2 p-1.5 items-center", {
                border,
            })}
        >
            <Icon icon={IconNames.SEARCH} className="t-muted" />
            <input
                autoFocus
                type={clear ? "search" : "text"}
                placeholder="Search..."
                value={searchInput}
                onClick={(e) => {
                    e.stopPropagation();
                }}
                onChange={(e) => handleSearchInput(e.target.value)}
                className="t-muted"
                style={{ flex: 1, backgroundColor: "transparent" }}
            />
        </div>
    );
};
