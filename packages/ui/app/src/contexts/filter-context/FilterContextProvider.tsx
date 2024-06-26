import { PropsWithChildren, useCallback, useMemo, useState } from "react";
import { FilterContext, FilterContextValue } from "./FilterContext";

export const FilterContextProvider: React.FC<PropsWithChildren> = ({ children }) => {
    const [activeFilters, setActiveFilters] = useState<string[]>([]);

    const handleSetActiveFilters = useCallback(
        (filterId: string): void => {
            if (activeFilters.includes(filterId)) {
                setActiveFilters(
                    (prevState) => prevState && prevState.filter((activeFilterId) => activeFilterId !== filterId),
                );
            } else {
                setActiveFilters((prevState) => (prevState ? [...prevState, filterId] : [filterId]));
            }
        },
        [activeFilters],
    );

    const value = useMemo<FilterContextValue>(
        () => ({
            activeFilters,
            handleSetActiveFilters,
        }),
        [activeFilters, handleSetActiveFilters],
    );

    return <FilterContext.Provider value={value}>{children}</FilterContext.Provider>;
};
