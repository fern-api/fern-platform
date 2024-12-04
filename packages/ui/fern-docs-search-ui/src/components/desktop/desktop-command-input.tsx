import { TooltipPortal } from "@radix-ui/react-tooltip";
import { forwardRef } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";

interface DesktopCommandInputProps extends React.ComponentPropsWithoutRef<typeof TooltipTrigger> {
    inputError: string | null;
}

export const DesktopCommandInputError = forwardRef<HTMLButtonElement, DesktopCommandInputProps>(
    ({ inputError, children, ...props }, ref) => {
        if (inputError == null) {
            return children;
        }
        return (
            <TooltipProvider>
                <Tooltip open={true}>
                    <TooltipTrigger asChild {...props} ref={ref}>
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
