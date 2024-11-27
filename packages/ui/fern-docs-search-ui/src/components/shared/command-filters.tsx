import { FacetFilter } from "@/hooks/use-facets";
import { FilterOption, getFacetDisplay } from "@/utils/facet-display";
import { Command } from "cmdk";
import { ListFilter } from "lucide-react";
import { ComponentPropsWithoutRef, forwardRef } from "react";
import { useSearchContext } from "./search-context-provider";

export const CommandGroupFilters = forwardRef<
    HTMLDivElement,
    Omit<ComponentPropsWithoutRef<typeof Command.Group>, "onSelect"> & {
        facets: FilterOption[];
        onSelect?: (filter: FacetFilter) => void;
    }
>(({ facets, onSelect, ...props }, ref) => {
    const { preload } = useSearchContext();

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
                        void preload({ filters: [filter] });
                    }}
                >
                    <ListFilter />
                    <span className="flex-1">Filter to {getFacetDisplay(filter.facet, filter.value)}</span>
                    <span className="text-xs text-[var(--grayscale-a9)] self-center">{filter.count}</span>
                </Command.Item>
            ))}
        </Command.Group>
    );
});

CommandGroupFilters.displayName = "CommandGroupFilters";
