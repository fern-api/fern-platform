import { useEffect, useState } from "react";
import { SearchInput } from "./SearchInput";

export declare namespace TypeDefinitionDetails {
    export interface Props {
        elements: JSX.Element[];
    }
}

export const EnumDefinitionDetails = ({ elements }: TypeDefinitionDetails.Props): JSX.Element => {
    const [searchInput, setSearchInput] = useState("");
    const [filteredElements, setFilteredElements] = useState<JSX.Element[]>([]);

    useEffect(() => {
        const temp = elements.filter(
            (element) =>
                element.props.name.toLowerCase().includes(searchInput.toLowerCase()) ||
                element.props?.description?.toLowerCase().includes(searchInput.toLowerCase())
        );
        setFilteredElements(temp);
    }, [elements, searchInput]);

    return (
        <div style={styles.container}>
            <SearchInput searchInput={searchInput} handleSearchInput={setSearchInput} />
            <div style={styles.EnumStyles}>{filteredElements}</div>
        </div>
    );
};

const styles = {
    EnumStyles: {
        maxHeight: "120px",
        overflowY: "scroll",
        display: "flex",
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    } as const,
    container: {
        padding: 8,
        gap: 8,
        display: "flex",
        flexDirection: "column",
    } as const,
};
