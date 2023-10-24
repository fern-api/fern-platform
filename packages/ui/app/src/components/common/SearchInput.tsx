import { Icon } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import classNames from "classnames";

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
}: SearchProps): JSX.Element => {
    return (
        <div
            className={classNames("border-default rounded", {
                border,
            })}
            style={styles.container}
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

const styles = {
    container: {
        borderRadius: 5,
        padding: 5,
        width: "100%",
        display: "flex",
        flexDirection: "row",
        gap: 8,
    } as const,
};
