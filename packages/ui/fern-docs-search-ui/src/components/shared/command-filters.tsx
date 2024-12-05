import { Badge } from "@fern-ui/components/badges";
import { Command } from "cmdk";
import { ListFilter } from "lucide-react";
import { ComponentPropsWithoutRef, forwardRef } from "react";
import { useSearchBox } from "react-instantsearch";

import { FACET_DISPLAY_NAME_MAP, getFacetDisplay, toFilterOptions } from "../../utils/facet-display";
import { useFacetFilters, useFacets, usePreloadFacets } from "../search-client";
import { useCommandUx } from "./command-ux";

export const CommandGroupFilters = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<typeof Command.Group>>(
    (props, ref) => {
        const { clear } = useSearchBox();
        const { focus } = useCommandUx();
        const { filters, setFilters } = useFacetFilters();
        const options = toFilterOptions(useFacets(filters).facets);
        const preloadFacets = usePreloadFacets();

        if (options.length === 0) {
            return false;
        }

        return (
            <Command.Group ref={ref} heading="Filters" {...props}>
                {options.map((filter) => (
                    <Command.Item
                        key={`${filter.facet}:"${filter.value}"`}
                        value={`filter ${filter.facet} to ${filter.value}`}
                        onSelect={() => {
                            setFilters((prev) => [...prev, filter]);
                            clear();
                            focus();
                        }}
                        onPointerOver={() => {
                            void preloadFacets([filter]);
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
    },
);

CommandGroupFilters.displayName = "CommandGroupFilters";
