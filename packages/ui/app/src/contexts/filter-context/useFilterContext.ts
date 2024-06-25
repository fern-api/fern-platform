import { useContext } from "react";
import { FilterContext, FilterContextValue } from "./FilterContext";

export function useFilterContext(): FilterContextValue {
    return useContext(FilterContext);
}
