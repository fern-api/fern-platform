import { createContext } from "react";

export interface FilterContextValue {
    activeFilters: string[];
    handleSetActiveFilters: (filterId: string) => void;
}

export const FilterContext = createContext<FilterContextValue>({
    activeFilters: [],
    handleSetActiveFilters: () => undefined,
});
