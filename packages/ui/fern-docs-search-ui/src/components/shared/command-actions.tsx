import { PropsWithChildren, ReactNode } from "react";
import { useFacetFilters } from "../search-client";

/**
 * If facet filters are present, then actions are hidden.
 */
export const CommandActions = ({ children }: PropsWithChildren): ReactNode => {
    const { filters } = useFacetFilters();

    if (filters.length > 0) {
        return false;
    }

    return children;
};
