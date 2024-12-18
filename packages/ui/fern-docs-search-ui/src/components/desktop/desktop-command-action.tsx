import { Button } from "@fern-ui/components/button";
import { composeEventHandlers } from "@radix-ui/primitive";
import { CircleStop, CornerDownLeft } from "lucide-react";
import { ComponentPropsWithoutRef, forwardRef } from "react";

interface DesktopCommandActionProps {
    onClose?: () => void;
    isLoading?: boolean;
    onClickAskAI?: () => void;
    onStopAskAI?: () => void;
}

export const AskAiAction = forwardRef<
    HTMLButtonElement,
    DesktopCommandActionProps & ComponentPropsWithoutRef<typeof Button>
>(({ isLoading, onClickAskAI, onStopAskAI, onClose, ...props }, ref) => {
    if (isLoading) {
        return (
            <Button
                ref={ref}
                variant="ghost"
                size="iconSm"
                className="shrink-0"
                {...props}
                onClick={composeEventHandlers(props.onClick, onStopAskAI, { checkForDefaultPrevented: true })}
            >
                <CircleStop />
            </Button>
        );
    } else {
        return (
            <Button
                ref={ref}
                variant="ghost"
                size="iconSm"
                className="shrink-0"
                {...props}
                onClick={composeEventHandlers(props.onClick, onClickAskAI, { checkForDefaultPrevented: true })}
            >
                <CornerDownLeft />
            </Button>
        );
    }
});

AskAiAction.displayName = "AskAiAction";
