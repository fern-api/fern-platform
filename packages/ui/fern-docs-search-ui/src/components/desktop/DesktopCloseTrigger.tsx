import { Button } from "@/components/ui/button";
import { TooltipPortal } from "@radix-ui/react-tooltip";
import { ReactNode } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";

export function DesktopCloseTrigger({
    CloseTrigger,
}: {
    CloseTrigger?: ({ children }: { children: ReactNode }) => ReactNode;
}): ReactNode {
    if (CloseTrigger == null) {
        return false;
    }

    return (
        <TooltipProvider>
            <Tooltip>
                <CloseTrigger>
                    <TooltipTrigger asChild>
                        <Button size="xs" variant="outline">
                            <kbd>esc</kbd>
                        </Button>
                    </TooltipTrigger>
                </CloseTrigger>
                <TooltipPortal>
                    <TooltipContent>
                        <p>Close search</p>
                    </TooltipContent>
                </TooltipPortal>
            </Tooltip>
        </TooltipProvider>
    );
}
