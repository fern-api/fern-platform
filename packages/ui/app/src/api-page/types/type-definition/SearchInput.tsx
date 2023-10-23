import { Icon } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";

type SearchProps = {
    searchInput: string;
    handleSearchInput: (value: string) => void;
};

export const SearchInput = ({ searchInput, handleSearchInput }: SearchProps): JSX.Element => {
    return (
        <div className="border-default rounded border" style={styles.container}>
            <Icon icon={IconNames.SEARCH} className="t-muted" />
            <input
                autoFocus
                type="search"
                placeholder="Search..."
                value={searchInput}
                onChange={(e) => handleSearchInput(e.target.value)}
                className="t-muted"
                style={{ flex: 1, backgroundColor: "transparent" }}
            />
        </div>
    );
};

const styles = {
    container: {
        // border: "1px solid lightgrey",
        borderRadius: 5,
        padding: 5,
        width: "100%",
        display: "flex",
        flexDirection: "row",
        gap: 8,
    } as const,
};
