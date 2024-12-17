import { composeEventHandlers } from "@radix-ui/primitive";
import { composeRefs } from "@radix-ui/react-compose-refs";
import { Slot } from "@radix-ui/react-slot";
import { TooltipPortal } from "@radix-ui/react-tooltip";
import { ComponentPropsWithoutRef, forwardRef, useRef } from "react";
import { useIsomorphicLayoutEffect } from "swr/_internal";

import * as Command from "../cmdk";
import { useCommandUx } from "../shared";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";

export const DesktopCommandInputError = forwardRef<HTMLButtonElement, ComponentPropsWithoutRef<typeof TooltipTrigger>>(
    ({ children, asChild, ...props }, ref) => {
        const { inputError } = useCommandUx();
        if (inputError == null) {
            const Comp = asChild ? Slot : "button";
            return (
                <Comp {...props} ref={ref}>
                    {children}
                </Comp>
            );
        }
        return (
            <TooltipProvider>
                <Tooltip open={true}>
                    <TooltipTrigger {...props} ref={ref} asChild={asChild}>
                        {children}
                    </TooltipTrigger>
                    <TooltipPortal>
                        <TooltipContent side="bottom" align="start">
                            <p>{inputError}</p>
                        </TooltipContent>
                    </TooltipPortal>
                </Tooltip>
            </TooltipProvider>
        );
    },
);

DesktopCommandInputError.displayName = "DesktopCommandInputError";

export const DesktopCommandInput = forwardRef<HTMLInputElement, ComponentPropsWithoutRef<typeof Command.Input>>(
    ({ children, ...props }, forwardedRef) => {
        const scrollSelectedIntoView = Command.useScrollSelectedIntoView();
        const inputRef = useRef<HTMLInputElement>(null);
        const selectionState = useRef<number | null>(null);
        const { setInputRef } = useCommandUx();

        // there's a bug in the cmdk library where the input gets re-mounted when the user types, and the cursor position is lost
        // so when you're typing in the middle of the input, the cursor gets reset to the end of the input.
        // this is a workaround to save the cursor position when the user types, and then restore it when the input is mounted again
        useIsomorphicLayoutEffect(() => {
            setInputRef(inputRef.current);
            if (inputRef.current != null && selectionState.current != null) {
                inputRef.current.setSelectionRange(selectionState.current, selectionState.current);
            }
        });

        return (
            <Command.Input
                {...props}
                ref={composeRefs(inputRef, forwardedRef)}
                onChangeCapture={composeEventHandlers(props.onChangeCapture, (e) => {
                    selectionState.current = e.currentTarget.selectionStart;
                    scrollSelectedIntoView();
                })}
                onBlur={composeEventHandlers(props.onBlur, () => {
                    selectionState.current = null;
                })}
                onFocus={composeEventHandlers(props.onFocus, () => {
                    selectionState.current = null;
                })}
            >
                {children}
            </Command.Input>
        );
    },
);

DesktopCommandInput.displayName = "DesktopCommandInput";
