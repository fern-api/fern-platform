import { FacetFilter, useFacets } from "@/hooks/useFacets";
import { FacetName, getFacetDisplay, toFilterLabel } from "@/utils/facet-display";
import { EMPTY_ARRAY } from "@fern-api/ui-core-utils";
import { FilterIcon, Minus } from "lucide-react";
import { Dispatch, ReactElement, SetStateAction } from "react";
import { Button } from "../ui/button";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTrigger } from "../ui/dialog";
import { Label } from "../ui/label";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";

export function MobileFacetDialog({
    filters,
    setFilters,
}: {
    /**
     * Filters already applied to the search.
     */
    filters?: readonly FacetFilter[];
    /**
     * Function to update the filters.
     */
    setFilters?: Dispatch<SetStateAction<FacetFilter[]>>;
}): ReactElement {
    const { data: facetsResponse } = useFacets({ filters: filters ?? EMPTY_ARRAY });

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button size="icon" className="shrink-0" variant={filters?.length ? "default" : "outline"}>
                    <FilterIcon />
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader className="text-lg font-semibold">Filters</DialogHeader>

                {filters?.map((filter) => (
                    <MobileFacetFilterRadio
                        key={`${filter.facet}:${filter.value}`}
                        facet={filter.facet}
                        value={filter.value}
                        filters={filters}
                        removeFilter={() => {
                            setFilters?.((prev) => prev.filter((f) => f.facet !== filter.facet));
                        }}
                        updateFilter={(value) => {
                            setFilters?.((prev) => prev.map((f) => (f.facet === filter.facet ? { ...f, value } : f)));
                        }}
                    />
                ))}

                {Object.entries(facetsResponse ?? {})
                    .filter(([_, options]) => options.length)
                    .map(([facet]) => (
                        <MobileFacetFilterRadio
                            key={facet}
                            facet={facet as FacetName}
                            filters={filters ?? EMPTY_ARRAY}
                            updateFilter={(value) => {
                                setFilters?.((prev) => [...prev, { facet: facet as FacetName, value }]);
                            }}
                        />
                    ))}
                <DialogFooter>
                    <DialogClose asChild>
                        <Button>Apply filters</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function MobileFacetFilterRadio({
    facet,
    value,
    filters,
    removeFilter,
    updateFilter,
}: {
    facet: FacetName;
    value?: string;
    filters: readonly FacetFilter[];
    removeFilter?: () => void;
    updateFilter?: (value: string) => void;
}): ReactElement {
    const otherFilters = filters.filter((f) => f.facet !== facet);

    const { data: facets } = useFacets({ filters: otherFilters });

    const options = facets?.[facet] ?? [];

    return (
        <RadioGroup value={value} onValueChange={updateFilter}>
            <h3 className="font-semibold">{toFilterLabel(facet)}</h3>

            {options.map((option) => (
                <div key={option.value}>
                    <RadioGroupItem value={option.value} id={`${facet}-${option.value}`} className="peer sr-only" />
                    <Label
                        htmlFor={`${facet}-${option.value}`}
                        className="flex flex-row items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                    >
                        {getFacetDisplay(facet, option.value, { small: true, titleCase: true })}
                        <span className="text-muted-foreground">{String(option.count)}</span>
                    </Label>
                </div>
            ))}
            {value != null && (
                <Button variant="outline" onClick={removeFilter}>
                    <Minus />
                    Remove filter
                </Button>
            )}
        </RadioGroup>
    );
}
