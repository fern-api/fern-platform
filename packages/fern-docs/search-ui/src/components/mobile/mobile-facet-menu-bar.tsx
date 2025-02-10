import {
  ComponentPropsWithoutRef,
  Fragment,
  ReactNode,
  forwardRef,
} from "react";

import * as Menubar from "@radix-ui/react-menubar";
import { Check, ChevronDown, Minus } from "lucide-react";

import { EMPTY_ARRAY } from "@fern-api/ui-core-utils";
import {
  AvailabilityBadge,
  AvailabilityDisplayNames,
  Badge,
  HttpMethodBadge,
  isAvailability,
  isHttpMethod,
} from "@fern-docs/components/badges";
import { FacetName } from "@fern-docs/search-server/algolia/types";

import { FacetFilter } from "../../types";
import { getFacetDisplay, toFilterLabel } from "../../utils/facet-display";
import { useFacetFilters, useFacets } from "../search-client";
import { cn } from "../ui/cn";

export function MobileFacetMenuBar({
  onUpdateFilters,
}: {
  onUpdateFilters?: () => void;
}): ReactNode {
  const { filters, setFilters } = useFacetFilters();
  const { facets: facetsResponse } = useFacets(EMPTY_ARRAY);
  const facets = (Object.keys(facetsResponse ?? {}) as FacetName[]).filter(
    (facet) => facetsResponse?.[facet]?.length
  );

  if (facets.length === 0) {
    return false;
  }

  return (
    <Menubar.Root className="flex gap-2 overflow-x-auto overflow-y-hidden p-2 [&::-webkit-scrollbar]:hidden">
      {facets.map((facet) => {
        const value = filters?.find((f) => f.facet === facet)?.value;
        return (
          <MobileFacetMenu
            key={facet}
            facet={facet}
            value={value}
            filters={filters ?? EMPTY_ARRAY}
            removeFilter={() =>
              setFilters?.((prev) => prev.filter((f) => f.facet !== facet))
            }
            updateFilter={(value) => {
              setFilters?.((prev) => {
                const newFilters = prev.filter((f) => f.facet !== facet);
                newFilters.push({ facet, value });
                return newFilters;
              });
              onUpdateFilters?.();
            }}
          />
        );
      })}
    </Menubar.Root>
  );
}

function MobileFacetMenu({
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
}) {
  const otherFilters = filters.filter((f) => f.facet !== facet);

  const { facets, isLoading } = useFacets(otherFilters);

  const options = facets?.[facet] ?? EMPTY_ARRAY;
  const optionsWithCurrent =
    value == null || options.some((o) => o.value === value)
      ? options
      : [{ value, count: 0 }, ...options];

  return (
    <Menubar.Menu key={facet}>
      <Menubar.Trigger
        asChild
        disabled={isLoading || optionsWithCurrent.length === 0}
      >
        <FacetBadge facet={facet} value={value} />
      </Menubar.Trigger>
      <Menubar.Portal>
        <Menubar.Content
          sideOffset={5}
          side="bottom"
          avoidCollisions
          align="start"
          className="absolute z-50 min-w-[220px] overflow-hidden rounded-lg border border-[var(--grayscale-a5)] bg-[var(--grayscale-a1)] p-0 shadow-lg backdrop-blur-lg"
          hidden={isLoading || optionsWithCurrent.length === 0}
        >
          <Menubar.RadioGroup value={value} onValueChange={updateFilter}>
            {optionsWithCurrent.map(({ value, count }, idx) => (
              <Fragment key={value}>
                {idx > 0 && (
                  <Menubar.Separator className="h-px bg-[var(--grayscale-a5)]" />
                )}
                <Menubar.RadioItem
                  value={value}
                  id={`${facet}-${value}`}
                  asChild
                >
                  <MenubarItem>
                    <span className="inline-flex items-baseline gap-1">
                      {getFacetDisplay(facet, value, {
                        titleCase: true,
                      })}
                      <Badge size="sm" color="gray" grayscale="olive">
                        {String(count)}
                      </Badge>
                    </span>

                    <Menubar.ItemIndicator>
                      <Check className="size-4 text-[var(--accent-a9)]" />
                    </Menubar.ItemIndicator>
                  </MenubarItem>
                </Menubar.RadioItem>
              </Fragment>
            ))}
            {value != null && (
              <Menubar.Group>
                <Menubar.Separator className="h-px bg-[var(--grayscale-a5)]" />
                <Menubar.Item onClick={removeFilter} asChild>
                  <MenubarItem>
                    Remove filter
                    <Minus className="size-4 text-[var(--grayscale-a9)]" />
                  </MenubarItem>
                </Menubar.Item>
              </Menubar.Group>
            )}
          </Menubar.RadioGroup>
        </Menubar.Content>
      </Menubar.Portal>
    </Menubar.Menu>
  );
}

const FacetBadge = forwardRef<
  HTMLButtonElement,
  { facet: FacetName; value?: string } & Omit<
    ComponentPropsWithoutRef<"button">,
    "color" | "variant"
  >
>(({ facet, value, ...props }, ref) => {
  if (value != null && isHttpMethod(value)) {
    return (
      <HttpMethodBadge
        ref={ref}
        method={value}
        variant="solid"
        interactive
        rounded
        {...props}
      >
        {value}
        <ChevronDown />
      </HttpMethodBadge>
    );
  }

  if (value != null && isAvailability(value)) {
    return (
      <AvailabilityBadge
        ref={ref}
        availability={value}
        variant="solid"
        interactive
        rounded
        {...props}
      >
        {AvailabilityDisplayNames[value]}
        <ChevronDown />
      </AvailabilityBadge>
    );
  }

  return (
    <Badge
      ref={ref}
      interactive
      rounded
      color={value != null ? "accent" : "gray"}
      variant={value != null ? "solid" : "subtle"}
      {...props}
    >
      {(value != null
        ? getFacetDisplay(facet, value, { titleCase: true })
        : undefined) ?? toFilterLabel(facet)}
      <ChevronDown />
    </Badge>
  );
});

FacetBadge.displayName = "FacetBadge";

const MenubarItem = forwardRef<HTMLDivElement, Menubar.MenubarItemProps>(
  (props, ref) => {
    return (
      <Menubar.Item
        ref={ref}
        {...props}
        className={cn(
          "flex cursor-pointer items-center justify-between px-4 py-2 focus:bg-[var(--accent-a3)] focus:outline-none",
          props.className
        )}
      />
    );
  }
);

MenubarItem.displayName = "MenubarItem";
