import { composeEventHandlers } from "@radix-ui/primitive";
import { Command } from "cmdk";
import { ComponentProps, ComponentPropsWithoutRef, KeyboardEvent, forwardRef, useRef, useState } from "react";
import { useSearchBox } from "react-instantsearch";
import tunnel from "tunnel-rat";
import { useFacetFilters } from "../search-client";
import { CommandUxProvider } from "../shared/command-ux";
import "../shared/common.scss";
import { DesktopCommandInputError } from "./desktop-command-input";
import "./desktop.scss";

export type DesktopCommandSharedProps = Omit<ComponentProps<typeof Command>, "onSelect">;

export interface DesktopCommandProps {
    onClose?: () => void;
}

const aboveInput = tunnel();
const beforeInput = tunnel();
const afterInput = tunnel();

/**
 * The desktop command is intended to be used within a dialog component.
 */
const DesktopCommand = forwardRef<
    HTMLDivElement,
    DesktopCommandProps &
        ComponentPropsWithoutRef<typeof Command> & {
            onEscape?: (e: KeyboardEvent<HTMLDivElement>) => void;
        }
>(({ onEscape: onEscape_, ...props }, ref) => {
    const { onClose, children, ...rest } = props;
    const { query, refine, clear } = useSearchBox();
    const { filters, popFilter, clearFilters } = useFacetFilters();
    const [inputError, setInputError] = useState<string | null>(null);

    const inputRef = useRef<HTMLInputElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    const focus = ({ scrollToTop = true }: { scrollToTop?: boolean } = {}) => {
        // add a slight delay so that the focus doesn't get stolen
        setTimeout(() => {
            inputRef.current?.focus();
            if (scrollToTop) {
                scrollRef.current?.scrollTo({ top: 0 });
            }
        }, 0);
    };

    const popOrClearFilters = (e: KeyboardEvent<HTMLDivElement>) => {
        if (e.metaKey) {
            clearFilters();
        } else {
            popFilter();
        }
        focus();
    };

    const onEscape = composeEventHandlers(
        onEscape_,
        (e: KeyboardEvent<HTMLDivElement>) => {
            if (query.length > 0) {
                clear();
                focus();
            } else if (filters.length > 0) {
                popOrClearFilters(e);
            } else {
                onClose?.();
            }
            e.stopPropagation();
        },
        { checkForDefaultPrevented: false },
    );

    return (
        <Command
            label="Search"
            ref={ref}
            {...rest}
            id="fern-search-desktop-command"
            onKeyDownCapture={composeEventHandlers(
                rest.onKeyDownCapture,
                (e) => {
                    // on keydown, clear input error
                    setInputError(null);

                    // if escape, handle it
                    if (e.key === "Escape") {
                        return onEscape(e);
                    }

                    if (e.key === "Backspace" && query.length === 0) {
                        return popOrClearFilters(e);
                    }

                    // if input is focused, do nothing
                    if (document.activeElement === inputRef.current) {
                        return;
                    }

                    // if input is alphanumeric, focus input
                    // note: this func is onKeyDownCapture so it will fire before the input
                    // which is important so that the first character typed isn't swallowed
                    if (/^[a-zA-Z0-9]$/.test(e.key)) {
                        // focus input _immediately_:
                        inputRef.current?.focus();
                    }
                },
                { checkForDefaultPrevented: false },
            )}
        >
            <CommandUxProvider focus={focus} setInputError={setInputError}>
                <div
                    className="cursor-text"
                    onClick={() => {
                        inputRef.current?.focus();
                    }}
                >
                    <aboveInput.Out />

                    <div data-cmdk-fern-header="">
                        <beforeInput.Out />

                        <DesktopCommandInputError inputError={inputError} asChild>
                            <Command.Input
                                ref={inputRef}
                                inputMode="search"
                                autoFocus
                                value={query}
                                maxLength={100}
                                placeholder="Search"
                                onValueChange={(value) => {
                                    refine(value);
                                    focus();
                                }}
                            />
                        </DesktopCommandInputError>

                        <afterInput.Out />
                    </div>
                </div>

                <Command.List ref={scrollRef} tabIndex={-1}>
                    {children}
                </Command.List>
            </CommandUxProvider>
        </Command>
    );
});

DesktopCommand.displayName = "DesktopCommand";

const DesktopCommandBeforeInput = beforeInput.In;
const DesktopCommandAfterInput = afterInput.In;
const DesktopCommandAboveInput = aboveInput.In;

export { DesktopCommand, DesktopCommandAboveInput, DesktopCommandAfterInput, DesktopCommandBeforeInput };
