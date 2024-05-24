import { MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { ReactElement } from "react";
import { FernInput } from "./FernInput";

type SearchProps = {
    searchInput: string;
    handleSearchInput: (value: string) => void;
    border?: boolean; //This is used to display a rounded border
    clear?: boolean; //This will show/hide the default search input clear (X) button
    autofocus?: boolean;
};

export const SearchInput = ({
    searchInput,
    handleSearchInput,
    clear = true,
    autofocus = false,
}: SearchProps): ReactElement => {
    return (
        <FernInput
            autoFocus={autofocus}
            type={clear ? "search" : "text"}
            placeholder="Search..."
            value={searchInput}
            onClick={(e) => {
                e.stopPropagation();
            }}
            onChange={(e) => handleSearchInput(e.target.value)}
            className="w-full"
            style={{ flex: 1, backgroundColor: "transparent" }}
            leftIcon={<MagnifyingGlassIcon className="t-muted" />}
        />
    );
};
