import clsx from "clsx";
import { ReactElement } from "react";
import { FilterTag } from "../components/FilterTag";
import { useFilterContext } from "../contexts/filter-context/useFilterContext";

interface FilterPanelProps {
    yearsArray?: string[];
    tagsArray?: string[];
    horizontal?: boolean;
}

export function FilterPanel({ yearsArray, tagsArray, horizontal = false }: FilterPanelProps): ReactElement {
    const { activeFilters, handleSetActiveFilters } = useFilterContext();

    return (
<<<<<<< HEAD
        <div className={clsx("p-4 mt-20 fixed mx-12 max-w-80 flex-col", { "flex-row": horizontal })}>
            <div className="text-md underline m-2">Filter entries</div>
            <div className="flex flex-wrap gap-1.5">
=======
        <div className="p-4 mt-20 fixed mx-12 max-w-80">
            <div className="text-md ml-1 mb-4">Filter</div>
            <div className="flex flex-wrap gap-2">
>>>>>>> 2c08eeb6e (Changing styling of filter panel)
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
            <hr className="my-3" />
            <div className="flex flex-wrap gap-2">
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
