import { Button } from "@/components/ui/button";
import { TooltipPortal } from "@radix-ui/react-tooltip";
import { ComponentPropsWithoutRef, forwardRef } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";

export const DesktopCloseTrigger = forwardRef<HTMLButtonElement, ComponentPropsWithoutRef<typeof Button>>(
    ({ children, ...props }, ref) => {
        return (
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button ref={ref} size="xs" variant="outline" {...props}>
                            {children ?? <kbd>esc</kbd>}
                        </Button>
                    </TooltipTrigger>
                    <TooltipPortal>
                        <TooltipContent>
                            <p>Close search</p>
                        </TooltipContent>
                    </TooltipPortal>
                </Tooltip>
            </TooltipProvider>
        );
    },
);

DesktopCloseTrigger.displayName = "DesktopCloseTrigger";
