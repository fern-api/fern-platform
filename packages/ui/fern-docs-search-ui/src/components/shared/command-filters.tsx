import { FacetFilter } from "@/hooks/use-facets";
import { FilterOption, getFacetDisplay } from "@/utils/facet-display";
import { Command } from "cmdk";
import { ListFilter } from "lucide-react";
import { ComponentPropsWithoutRef, forwardRef } from "react";

export const CommandGroupFilters = forwardRef<
    HTMLDivElement,
    Omit<ComponentPropsWithoutRef<typeof Command.Group>, "onSelect"> & {
        facets: FilterOption[];
        onSelect?: (filter: FacetFilter) => void;
        preload?: (filter: FacetFilter) => void;
    }
>(({ facets, onSelect, preload, ...props }, ref) => {
    if (facets.length === 0) {
        return false;
    }

    return (
        <Command.Group ref={ref} heading="Filters" {...props}>
            {facets.map((filter) => (
                <Command.Item
                    key={`${filter.facet}:"${filter.value}"`}
                    value={`${filter.facet}:"${filter.value}"`}
                    onSelect={() => {
                        onSelect?.(filter);
                    }}
                    onMouseOver={() => {
                        preload?.(filter);
                    }}
                >
                    <ListFilter />
                    <span className="flex-1">Search {getFacetDisplay(filter.facet, filter.value)}</span>
                    <span className="text-xs text-[#969696] dark:text-white/50 self-center">{filter.count}</span>
                </Command.Item>
            ))}
        </Command.Group>
    );
});

CommandGroupFilters.displayName = "CommandGroupFilters";
