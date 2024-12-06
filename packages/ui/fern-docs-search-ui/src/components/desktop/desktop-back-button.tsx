import { usePlatformKbdShortcut } from "@fern-ui/react-commons";
import { TooltipPortal } from "@radix-ui/react-tooltip";
import { ArrowLeft } from "lucide-react";
import { Kbd } from "../../../../components/src/kbd";
import { Button } from "../ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";

export function DesktopBackButton({
    pop,
    clear,
    showAdditionalCommand,
}: {
    pop: () => void;
    clear: () => void;
    /**
     * if false, the text says `Del` to go back
     * if true, the text says `Del` to go back or `Ctrl` `Del` to go to root search
     */
    showAdditionalCommand?: boolean;
}): React.ReactNode {
    const shortcut = usePlatformKbdShortcut();

    const additionalCommand = showAdditionalCommand && shortcut && (
        <>
            <span> or </span>
            <Kbd className="mx-1">{shortcut}</Kbd>
            <Kbd className="me-1">Del</Kbd>
            <span> to go to root search</span>
        </>
    );

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        size="iconSm"
                        variant="outline"
                        className="shrink-0"
                        onClickCapture={(e) => {
                            if (e.metaKey || e.ctrlKey) {
                                clear();
                            } else {
                                pop();
                            }
                        }}
                        onKeyDownCapture={(e) => {
                            if (e.key === "Backspace" || e.key === "Delete" || e.key === "Space" || e.key === "Enter") {
                                if (e.metaKey || e.ctrlKey) {
                                    clear();
                                } else {
                                    pop();
                                }
                                e.stopPropagation();
                            }
                        }}
                    >
                        <ArrowLeft />
                    </Button>
                </TooltipTrigger>
                <TooltipPortal>
                    <TooltipContent className="shrink-0">
                        <p>
                            <Kbd className="me-1">Del</Kbd>
                            <span> to go back</span>
                            {additionalCommand}
                        </p>
                    </TooltipContent>
                </TooltipPortal>
            </Tooltip>
        </TooltipProvider>
    );
}
