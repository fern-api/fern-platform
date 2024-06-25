import { ReactElement } from "react";
import { FilterTag } from "../components/FilterTag";
import { useFilterContext } from "../contexts/filter-context/useFilterContext";

interface FilterPanelProps {
    yearsArray?: string[];
    tagsArray?: string[];
}

export function FilterPanel({ yearsArray, tagsArray }: FilterPanelProps): ReactElement {
    const { activeFilters, handleSetActiveFilters } = useFilterContext();

    return (
        <div className="border p-4 border-black rounded-lg mt-80 fixed mx-12">
            <div className="text-md underline m-2">Filter entries</div>
            <div className="flex flex-wrap gap-1.5">
                {yearsArray &&
                    yearsArray.map((yearId) => (
                        <FilterTag
                            active={activeFilters.includes(yearId)}
                            key={yearId}
                            tagLabel={yearId}
                            onClickHandler={() => handleSetActiveFilters(yearId)}
                        />
                    ))}
            </div>
            <hr className="my-4 mx-2" />
            <div className="flex flex-wrap gap-1.5">
                {tagsArray &&
                    tagsArray.map((tagId) => (
                        <FilterTag
                            active={activeFilters.includes(tagId)}
                            key={tagId}
                            tagLabel={tagId}
                            onClickHandler={() => handleSetActiveFilters(tagId)}
                        />
                    ))}
            </div>
        </div>
    );
}
