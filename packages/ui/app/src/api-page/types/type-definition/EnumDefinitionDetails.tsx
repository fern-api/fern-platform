import { useEffect, useState } from "react";
import { Empty } from "../../../components/common/Empty";

export declare namespace TypeDefinitionDetails {
    export interface Props {
        elements: JSX.Element[];
        searchInput: string;
    }
}

export const EnumDefinitionDetails = ({ elements, searchInput }: TypeDefinitionDetails.Props): JSX.Element => {
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
            {filteredElements.length > 0 ? (
                <div style={styles.EnumStyles}>{filteredElements}</div>
            ) : (
                <Empty name="No results" description="No enum values found" />
            )}
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
