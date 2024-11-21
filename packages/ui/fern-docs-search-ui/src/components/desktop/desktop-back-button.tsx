import { TooltipPortal } from "@radix-ui/react-tooltip";
import { ArrowLeft } from "lucide-react";
import { Button } from "../ui/button";
import { Kbd } from "../ui/kbd";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";

export function DesktopBackButton({ pop, clear }: { pop: () => void; clear: () => void }): React.ReactNode {
    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        size="iconSm"
                        variant="outline"
                        className="shrink-0"
                        onClickCapture={(e) => {
                            if (e.metaKey) {
                                clear();
                            } else {
                                pop();
                            }
                        }}
                        onKeyDownCapture={(e) => {
                            if (e.key === "Backspace" || e.key === "Delete" || e.key === "Space" || e.key === "Enter") {
                                if (e.metaKey) {
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
                            <Kbd className="me-1">del</Kbd>
                            <span> to go back or </span>
                            <Kbd className="mx-1">⌘</Kbd>
                            <Kbd className="me-1">del</Kbd>
                            <span> to go to root search</span>
                        </p>
                    </TooltipContent>
                </TooltipPortal>
            </Tooltip>
        </TooltipProvider>
    );
}
