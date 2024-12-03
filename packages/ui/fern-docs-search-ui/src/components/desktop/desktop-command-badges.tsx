import { FacetFilter } from "@/hooks/use-facets";
import { Badge } from "@fern-ui/fern-docs-badges";
import { ComponentPropsWithoutRef, Dispatch, SetStateAction, forwardRef } from "react";
import { DesktopFilterDropdownMenu } from "./desktop-filter-dropdown-menu";

interface DesktopCommandBadgesProps {
    filters?: readonly FacetFilter[];
    isAskAI: boolean;
    setFilters?: Dispatch<SetStateAction<FacetFilter[]>>;
    onDropdownClose?: () => void;
}

export const DesktopCommandBadges = forwardRef<
    HTMLDivElement,
    DesktopCommandBadgesProps & ComponentPropsWithoutRef<"div">
>((props, ref) => {
    const { filters, isAskAI, setFilters, onDropdownClose, ...rest } = props;

    if ((filters == null || filters.length === 0) && !isAskAI) {
        return false;
    }

    return (
        <div ref={ref} className="flex items-center gap-2 p-2 pb-0 cursor-text" {...rest}>
            {filters?.map((filter) => (
                <DesktopFilterDropdownMenu
                    key={`${filter.facet}:${filter.value}`}
                    filter={filter}
                    filters={filters}
                    removeFilter={() => {
                        setFilters?.((prev) => prev.filter((f) => f.facet !== filter.facet));
                    }}
                    updateFilter={(value) => {
                        setFilters?.((prev) => prev.map((f) => (f.facet === filter.facet ? { ...f, value } : f)));
                    }}
                    onClose={onDropdownClose}
                />
            ))}

            {isAskAI && (
                <Badge size="sm" variant="outlined-subtle">
                    Ask AI
                </Badge>
            )}
        </div>
    );
});

DesktopCommandBadges.displayName = "DesktopCommandBadges";
