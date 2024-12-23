import { ComponentPropsWithoutRef, forwardRef } from "react";
import { useFacetFilters } from "../search-client";
import tunnel from "../tunnel-rat";
import { DesktopFilterDropdownMenu } from "./desktop-filter-dropdown-menu";

interface DesktopCommandBadgesProps {
  onDropdownClose?: () => void;
}

export const aboveInput = tunnel();

export const DesktopCommandBadges = forwardRef<
  HTMLDivElement,
  DesktopCommandBadgesProps & ComponentPropsWithoutRef<"div">
>((props, ref) => {
  const { onDropdownClose, children, ...rest } = props;
  const { filters, setFilters } = useFacetFilters();
  const hasChildren = aboveInput.useHasChildren();

  if ((filters == null || filters.length === 0) && !hasChildren) {
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
            setFilters?.((prev) =>
              prev.filter((f) => f.facet !== filter.facet)
            );
          }}
          updateFilter={(value) => {
            setFilters?.((prev) =>
              prev.map((f) => (f.facet === filter.facet ? { ...f, value } : f))
            );
          }}
        />
      ))}
      <aboveInput.Out />
    </div>
  );
});

DesktopCommandBadges.displayName = "DesktopCommandBadges";

export const DesktopCommandAboveInput = aboveInput.In;
