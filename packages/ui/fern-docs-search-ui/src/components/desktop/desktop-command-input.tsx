import { TooltipPortal } from "@radix-ui/react-tooltip";
import { Command } from "cmdk";
import { forwardRef } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";

interface DesktopCommandInputProps extends React.ComponentPropsWithoutRef<typeof Command.Input> {
    inputError: string | null;
    query: string;
}

export const DesktopCommandInput = forwardRef<HTMLInputElement, DesktopCommandInputProps>(
    ({ inputError, query, ...props }, ref) => {
        return (
            <TooltipProvider>
                <Tooltip open={inputError != null}>
                    <TooltipTrigger asChild>
                        <Command.Input
                            ref={ref}
                            inputMode="search"
                            autoFocus
                            value={query}
                            maxLength={100}
                            {...props}
                        />
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

DesktopCommandInput.displayName = "DesktopCommandInput";
