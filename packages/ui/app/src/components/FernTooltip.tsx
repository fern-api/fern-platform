import * as Tooltip from "@radix-ui/react-tooltip";
import classNames from "classnames";
import { FC, ReactNode } from "react";

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
    if (content == null || content === "") {
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
                        "animate-popover border-default bg-background max-w-xs rounded-lg border p-2 text-xs leading-none will-change-[transform,opacity] shadow-sm",
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
