import { Empty } from "@fern-docs/components";
import { ReactElement, useEffect, useState } from "react";

export interface EnumDefinitionDetailsProps {
    elements: ReactElement[];
    searchInput: string;
}

export const EnumDefinitionDetails = ({
    elements,
    searchInput,
}: EnumDefinitionDetailsProps): ReactElement => {
    const [filteredElements, setFilteredElements] = useState<ReactElement[]>(
        []
    );

    useEffect(() => {
        const temp = elements.filter(
            (element) =>
                element.props.name
                    .toLowerCase()
                    .includes(searchInput.toLowerCase()) ||
                element.props?.description
                    ?.toLowerCase()
                    .includes(searchInput.toLowerCase())
        );
        setFilteredElements(temp);
    }, [elements, searchInput]);

    // use 140px to decapitate overflowing enum values and indicate scrollability
    return (
        <div className="max-h-[140px] gap-2 overflow-y-auto p-2">
            {filteredElements.length > 0 ? (
                <div className="flex flex-wrap gap-2">{filteredElements}</div>
            ) : (
                <Empty name="No results" description="No enum values found" />
            )}
        </div>
    );
};
