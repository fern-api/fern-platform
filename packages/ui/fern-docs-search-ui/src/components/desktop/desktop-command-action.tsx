import { composeEventHandlers } from "@radix-ui/primitive";
import { CircleStop, CornerDownLeft } from "lucide-react";
import { ComponentPropsWithoutRef, forwardRef } from "react";
import { Button } from "../ui/button";
import { DesktopCloseTrigger } from "./desktop-close-trigger";

interface DesktopCommandActionProps {
    onClose?: () => void;
    isAskAI?: boolean;
    isAskAILoading?: boolean;
    onClickAskAI?: () => void;
    onStopAskAI?: () => void;
}

export const DesktopCommandAction = forwardRef<
    HTMLButtonElement,
    DesktopCommandActionProps & ComponentPropsWithoutRef<typeof Button>
>(({ isAskAI, isAskAILoading, onClickAskAI, onStopAskAI, onClose, ...props }, ref) => {
    if (isAskAI) {
        if (isAskAILoading) {
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
    }

    return (
        <DesktopCloseTrigger
            ref={ref}
            {...props}
            onClick={composeEventHandlers(props.onClick, onClose, { checkForDefaultPrevented: true })}
        />
    );
});

DesktopCommandAction.displayName = "DesktopCommandAction";
