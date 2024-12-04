import { FacetFilter } from "@/hooks/use-facets";
import { FACET_DISPLAY_NAME_MAP } from "@/utils/facet-display";
import { Command } from "cmdk";
import { ComponentPropsWithoutRef, forwardRef, useRef, useState } from "react";
import { useSearchBox } from "react-instantsearch";
import "../shared/common.scss";
import { useFacetFilters } from "../shared/search-client";
import { Button } from "../ui/button";
import { cn } from "../ui/cn";
import { Input } from "../ui/input";
import { MobileFacetMenuBar } from "./mobile-facet-menu-bar";
import "./mobile.scss";

export interface MobileCommandProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export const MobileCommand = forwardRef<HTMLDivElement, MobileCommandProps & ComponentPropsWithoutRef<typeof Command>>(
    (props, ref) => {
        const { open, onOpenChange, children, ...rest } = props;
        const { query, refine } = useSearchBox();
        const { filters, resetFilters } = useFacetFilters();

        const inputRef = useRef<HTMLInputElement>(null);
        const scrollRef = useRef<HTMLDivElement>(null);
        const [masked, setMasked] = useState(false);

        const scrollTop = () => {
            setTimeout(() => {
                scrollRef.current?.scrollTo({ top: 0 });
            }, 0);
        };

        const focus = () => {
            setTimeout(() => {
                inputRef.current?.focus();
            }, 0);
        };

        return (
            <Command
                data-fern-docs-search-ui="mobile"
                ref={ref}
                {...rest}
                className={cn("flex flex-col", rest.className)}
            >
                <div data-cmdk-fern-header="">
                    <Command.Input
                        ref={inputRef}
                        autoFocus={false}
                        value={query}
                        placeholder={toPlaceholder(filters)}
                        onValueChange={(value) => {
                            refine(value);
                            setTimeout(() => {
                                scrollRef.current?.scrollTo({ top: 0 });
                            }, 0);
                        }}
                        maxLength={100}
                        asChild
                        onFocus={() => onOpenChange?.(true)}
                    >
                        <Input />
                    </Command.Input>
                    {open && (
                        <Button
                            onClick={() => {
                                onOpenChange?.(false);
                                resetFilters?.();
                            }}
                            className="shrink-0"
                            variant="secondary"
                        >
                            Cancel
                        </Button>
                    )}
                </div>
                {open && (
                    <MobileFacetMenuBar
                        onUpdateFilters={() => {
                            focus();
                            scrollTop();
                        }}
                    />
                )}
                <Command.List
                    ref={scrollRef}
                    tabIndex={-1}
                    className={cn("flex-1", {
                        "mask-grad-top-3": masked,
                    })}
                    onScroll={(e) => {
                        if (!(e.target instanceof HTMLElement)) {
                            return;
                        }
                        setMasked(e.target.scrollTop > 0);
                    }}
                >
                    {children}
                    {/* {isSearchOpen ? (
                    <>
                        <CommandGroupFilters
                            facets={facets}
                            onSelect={(filter) => {
                                setFilters?.([...filters, filter]);
                                clear();
                                focus();
                                scrollTop();
                            }}
                        />

                        {items.length === 0 && <CommandEmpty />}

                        {(query.trimStart().length > 0 || filters.length > 0) && (
                            <CommandSearchHits items={items} onSelect={onSelect} />
                        )}

                        <CommandGroupTheme setTheme={setTheme} />
                    </>
                ) : (
                    children
                )} */}
                </Command.List>
            </Command>
        );
    },
);

MobileCommand.displayName = "MobileCommand";

function toPlaceholder(filters: readonly FacetFilter[]): string {
    if (filters.length === 0) {
        return "Search";
    }

    return `Search ${filters.map((filter) => FACET_DISPLAY_NAME_MAP[filter.facet]?.[filter.value] ?? filter.value).join(", ")}`;
}
