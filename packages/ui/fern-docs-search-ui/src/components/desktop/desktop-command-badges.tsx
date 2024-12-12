import { ComponentPropsWithoutRef, forwardRef } from "react";
import { useFacetFilters } from "../search-client";
import { useCommandUx } from "../shared/command-ux";
import { DesktopFilterDropdownMenu } from "./desktop-filter-dropdown-menu";

interface DesktopCommandBadgesProps {
    onDropdownClose?: () => void;
}

export const DesktopCommandBadges = forwardRef<
    HTMLDivElement,
    DesktopCommandBadgesProps & ComponentPropsWithoutRef<"div">
>((props, ref) => {
    const { onDropdownClose, children, ...rest } = props;
    const { filters, setFilters } = useFacetFilters();
    const { focus } = useCommandUx();

    if ((filters == null || filters.length === 0) && !children) {
        return false;
    }

    return (
        <div ref={ref} className="flex items-center gap-2 p-2 pb-0" {...rest}>
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
                    onCloseAutoFocus={(e) => {
                        e.preventDefault();
                        focus({ scrollToTop: false });
                    }}
                />
            ))}
            {children}
        </div>
    );
});

DesktopCommandBadges.displayName = "DesktopCommandBadges";
