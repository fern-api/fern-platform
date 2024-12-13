import { useSearchHitsRerender } from "@/hooks/use-search-hits";
import { composeEventHandlers } from "@radix-ui/primitive";
import { composeRefs } from "@radix-ui/react-compose-refs";
import { ComponentPropsWithoutRef, KeyboardEventHandler, forwardRef, useCallback, useRef, useState } from "react";
import * as Command from "../cmdk";
import { CommandUxProvider } from "../shared/command-ux";

export const DesktopCommandRoot = forwardRef<
    HTMLDivElement,
    ComponentPropsWithoutRef<typeof Command.Root> & {
        onEscape?: KeyboardEventHandler<HTMLDivElement>;
        onPopState?: KeyboardEventHandler<HTMLDivElement>;
        escapeKeyShouldPopFilters?: boolean;
    }
>(({ children, onEscape, onPopState, escapeKeyShouldPopFilters, ...props }, forwardedRef) => {
    useSearchHitsRerender();

    const ref = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);
    const [inputError, setInputError] = useState<string | null | undefined>(null);
    const setInputRef = useCallback((ref: HTMLInputElement | HTMLTextAreaElement | null) => {
        inputRef.current = ref;
    }, []);

    return (
        <CommandUxProvider setInputRef={setInputRef} inputError={inputError} setInputError={setInputError}>
            <Command.Root
                label="Search"
                ref={composeRefs(forwardedRef, ref)}
                {...props}
                id="fern-search-desktop-command"
                onKeyDownCapture={composeEventHandlers(
                    props.onKeyDownCapture,
                    (e) => {
                        // on keydown, clear input error
                        setInputError(null);

                        // if escape, handle it
                        if (e.key === "Escape") {
                            if (inputRef.current?.value.length) {
                                inputRef.current.value = "";
                            } else if (escapeKeyShouldPopFilters) {
                                onPopState?.(e);
                            } else {
                                onEscape?.(e);
                            }
                            return;
                        }

                        const input = inputRef.current;

                        if (e.key === "Backspace" && !input?.value.length) {
                            onPopState?.(e);
                            return;
                        }

                        // if input is focused, do nothing
                        if (document.activeElement === input) {
                            return;
                        }

                        // if input is alphanumeric, space, backspace, delete, arrow left, arrow right, then focus input
                        // note: this func is onKeyDownCapture so it will fire before the input
                        // which is important so that the first character typed isn't swallowed
                        if (
                            /^[a-zA-Z0-9]$/.test(e.key) ||
                            e.key === " " ||
                            e.key === "Backspace" ||
                            e.key === "Delete" ||
                            e.key === "ArrowLeft" ||
                            e.key === "ArrowRight"
                        ) {
                            // focus input immediately:
                            input?.focus();
                        }
                    },
                    { checkForDefaultPrevented: false },
                )}
            >
                {children}
            </Command.Root>
        </CommandUxProvider>
    );
});

DesktopCommandRoot.displayName = "DesktopCommandRoot";
