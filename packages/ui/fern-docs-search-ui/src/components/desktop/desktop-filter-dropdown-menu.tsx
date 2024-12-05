import { Badge } from "@fern-ui/components/badges";
import { Minus } from "lucide-react";
import { ReactElement, cloneElement, isValidElement } from "react";
import { FacetFilter } from "../../types";
import { getFacetDisplay, toFilterLabel } from "../../utils/facet-display";
import { useFacets } from "../search-client";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuPortal,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuTrigger,
} from "../ui/dropdown";

export function DesktopFilterDropdownMenu({
    filter,
    filters,
    removeFilter,
    updateFilter,
    onCloseAutoFocus,
}: {
    filter: FacetFilter;
    removeFilter?: () => void;
    updateFilter?: (value: string) => void;
    filters: readonly FacetFilter[];
    onCloseAutoFocus?: (event: Event) => void;
}): ReactElement {
    const otherFilters = filters.filter((f) => f.facet !== filter.facet);

    const { facets } = useFacets(otherFilters);

    const options = facets?.[filter.facet] ?? [];

    const facetDisplay = getFacetDisplay(filter.facet, filter.value, { small: true, titleCase: true });

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                {isValidElement<{ interactive?: boolean }>(facetDisplay) ? (
                    cloneElement(facetDisplay, { interactive: true })
                ) : (
                    <Badge
                        variant="outlined-subtle"
                        size="sm"
                        className="fern-search-facet-filter-menu-button"
                        interactive
                    >
                        {facetDisplay}
                    </Badge>
                )}
            </DropdownMenuTrigger>
            <DropdownMenuPortal>
                <DropdownMenuContent
                    className="min-w-[200px]"
                    onKeyDownCapture={(e) => {
                        if (e.key === "Backspace") {
                            removeFilter?.();
                        }
                    }}
                    onCloseAutoFocus={onCloseAutoFocus}
                >
                    <DropdownMenuLabel>{toFilterLabel(filter.facet)}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {options.length > 0 && (
                        <>
                            <DropdownMenuRadioGroup
                                value={filter.value}
                                onValueChange={(value) => {
                                    updateFilter?.(value);
                                }}
                            >
                                {options.map((option) => (
                                    <DropdownMenuRadioItem
                                        key={option.value}
                                        value={option.value}
                                        autoFocus={option.value === filter.value}
                                    >
                                        {getFacetDisplay(filter.facet, option.value, {
                                            small: true,
                                            titleCase: true,
                                        })}
                                        <Badge size="sm" rounded className="ml-auto">
                                            {option.count}
                                        </Badge>
                                    </DropdownMenuRadioItem>
                                ))}
                            </DropdownMenuRadioGroup>
                            <DropdownMenuSeparator />
                        </>
                    )}
                    <DropdownMenuGroup>
                        <DropdownMenuItem
                            onSelect={() => {
                                removeFilter?.();
                            }}
                        >
                            <Minus className="size-4" />
                            Remove filter
                            <DropdownMenuShortcut>del</DropdownMenuShortcut>
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenuPortal>
        </DropdownMenu>
    );
}
