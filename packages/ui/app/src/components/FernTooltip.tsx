import * as Tooltip from "@radix-ui/react-tooltip";
import classNames from "classnames";
import { FC, ReactNode } from "react";
import { useIsReady } from "../contexts/useIsReady";

interface FernTooltipProps extends Tooltip.TooltipProps, Tooltip.TooltipContentProps {
    content: ReactNode | undefined;
}

export const FernTooltip: FC<FernTooltipProps> = ({
    content,
    children,
    open,
    defaultOpen,
    onOpenChange,
    delayDuration,
    disableHoverableContent,
    ...props
}) => {
    const isReady = useIsReady();
    if (content == null || content === "" || !isReady) {
        return <>{children}</>;
    }
    return (
        <Tooltip.Root
            open={open}
            defaultOpen={defaultOpen}
            onOpenChange={onOpenChange}
            delayDuration={delayDuration}
            disableHoverableContent={disableHoverableContent}
        >
            <Tooltip.Trigger asChild>{children}</Tooltip.Trigger>
            <Tooltip.Portal>
                <Tooltip.Content
                    sideOffset={6}
                    {...props}
                    className={classNames(
                        "animate-popover border-default bg-background-translucent backdrop-blur max-w-xs rounded-lg border p-2 text-xs leading-none will-change-[transform,opacity] shadow-sm",
                        props.className,
                    )}
                >
                    {content}
                </Tooltip.Content>
            </Tooltip.Portal>
        </Tooltip.Root>
    );
};

export const FernTooltipProvider = Tooltip.Provider;
