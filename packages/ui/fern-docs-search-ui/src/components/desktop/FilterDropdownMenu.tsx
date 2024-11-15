import { useFacets } from "@/hooks/useFacets";
import { FacetName, toFilterLabel } from "@/utils/facet";
import { getFacetDisplay } from "@/utils/facet-display";
import { FilterX } from "lucide-react";
import { ReactElement } from "react";
import { Badge } from "../ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuTrigger,
} from "../ui/dropdown";

export function FilterDropdownMenu({
    appId,
    apiKey,
    domain,
    filter,
    filters,
    removeFilter,
    updateFilter,
}: {
    appId: string;
    apiKey: string;
    domain: string;
    filter: {
        facet: FacetName;
        value: string;
    };
    removeFilter?: () => void;
    updateFilter?: (value: string) => void;
    filters: { facet: FacetName; value: string }[];
}): ReactElement {
    const otherFilters = filters.filter((f) => f.facet !== filter.facet);

    const { data: facets } = useFacets({ appId, apiKey, domain, filters: otherFilters });

    const options = facets?.[filter.facet] ?? [];

    return (
        <DropdownMenu key={`${filter.facet}:${filter.value}`}>
            <DropdownMenuTrigger asChild>
                <Badge variant="outline" asChild>
                    <button>{getFacetDisplay(filter.facet, filter.value, { small: true, titleCase: true })}</button>
                </Badge>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                className="min-w-[200px]"
                onKeyDownCapture={(e) => {
                    if (e.key === "Backspace") {
                        removeFilter?.();
                    }
                }}
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
                                <DropdownMenuRadioItem key={option.value} value={option.value}>
                                    {getFacetDisplay(filter.facet, option.value, { small: true, titleCase: true })}
                                    <DropdownMenuShortcut>{option.count}</DropdownMenuShortcut>
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
                        <FilterX className="size-4" />
                        Remove filter
                        <DropdownMenuShortcut>del</DropdownMenuShortcut>
                    </DropdownMenuItem>
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
