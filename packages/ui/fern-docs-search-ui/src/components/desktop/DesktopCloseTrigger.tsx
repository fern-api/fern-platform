import { Button } from "@/components/ui/button";
import { TooltipPortal } from "@radix-ui/react-tooltip";
import { ReactNode } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";

export function DesktopCloseTrigger({ onClose }: { onClose: () => void }): ReactNode {
    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button size="xs" variant="outline" onClick={onClose}>
                        <kbd>esc</kbd>
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
}
