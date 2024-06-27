import { FernButton, FernCheckboxDropdown, RemoteFontAwesomeIcon } from "@fern-ui/components";
import { ChevronDownIcon } from "@radix-ui/react-icons";
import clsx from "clsx";
import { ReactElement, useMemo } from "react";
import { useFilterContext } from "../contexts/filter-context/useFilterContext";

interface FilterDropdownProps {
    yearsArray?: string[];
    tagsArray?: string[];
    vertical?: boolean;
}

export function FilterDropdown({
    yearsArray = [],
    tagsArray = [],
    vertical = false,
}: FilterDropdownProps): ReactElement {
    const { activeFilters, handleSetActiveFilters } = useFilterContext();
    const rawFilterValues = [...yearsArray, { type: "separator" }, ...tagsArray] as
        | FernCheckboxDropdown.Option[]
        | string[];

    const getDropdownOptions = useMemo(
        () => (rawValues: FernCheckboxDropdown.Option[] | string[]) =>
            rawValues.reduce((acc, currVal) => {
                let newAcc = [...acc];
                if (typeof currVal === "string") {
                    const isChecked: boolean = activeFilters.includes(currVal);
                    newAcc = [
                        ...acc,
                        {
                            checked: isChecked,
                            type: "value",
                            value: currVal,
                        },
                    ];
                } else if (typeof currVal === "object" && currVal.type === "separator") {
                    newAcc = [...acc, currVal];
                }
                return newAcc;
            }, [] as FernCheckboxDropdown.Option[]),
        [activeFilters],
    );

    // going to need to pass active filters into the checkbox dropdown in order to determine which items are checked

    return (
        <div className={clsx("flex max-w-80 flex-col min-w-1/2", { "mx-12 mt-20 fixed p-4": vertical })}>
            <FernCheckboxDropdown
                value="Filter"
                options={getDropdownOptions(rawFilterValues)}
                onSelectOption={(value) => {
                    handleSetActiveFilters(value);
                }}
            >
                <FernButton
                    icon={<RemoteFontAwesomeIcon className="bg-accent size-4" icon="filter" />}
                    rightIcon={<ChevronDownIcon />}
                    text="Filter"
                    size="small"
                    variant="outlined"
                    mono={true}
                />
            </FernCheckboxDropdown>
        </div>
    );
}
