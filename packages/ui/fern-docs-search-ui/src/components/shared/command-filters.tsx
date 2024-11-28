import { FacetFilter } from "@/hooks/use-facets";
import { FACET_DISPLAY_NAME_MAP, FilterOption, getFacetDisplay } from "@/utils/facet-display";
import { Badge } from "@fern-ui/fern-docs-badges";
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
                    value={`filter ${filter.facet} to ${filter.value}`}
                    onSelect={() => {
                        onSelect?.(filter);
                    }}
                    onMouseOver={() => {
                        void preload({ filters: [filter] });
                    }}
                    keywords={[FACET_DISPLAY_NAME_MAP[filter.facet]?.[filter.value] ?? filter.value]}
                >
                    <ListFilter />
                    <span className="flex-1">Filter to {getFacetDisplay(filter.facet, filter.value)}</span>
                    <Badge size="sm" rounded>
                        {filter.count}
                    </Badge>
                </Command.Item>
            ))}
        </Command.Group>
    );
});

CommandGroupFilters.displayName = "CommandGroupFilters";
