import { Slot } from "@radix-ui/react-slot";
import * as Tooltip from "@radix-ui/react-tooltip";
import { ComponentPropsWithoutRef, ReactNode, forwardRef } from "react";
import { cn } from "./cn";

declare const SIDE_OPTIONS: readonly ["top", "right", "bottom", "left"];
declare const ALIGN_OPTIONS: readonly ["start", "center", "end"];
type Side = (typeof SIDE_OPTIONS)[number];
type Align = (typeof ALIGN_OPTIONS)[number];
type Boundary = Element | null;

export const FernTooltip = forwardRef<
    HTMLButtonElement,
    Omit<ComponentPropsWithoutRef<"button">, "content"> & {
        open?: boolean;
        defaultOpen?: boolean;
        onOpenChange?: (open: boolean) => void;
        delayDuration?: number;
        content?: ReactNode;
        disableHoverableContent?: boolean;
        container?: HTMLElement | null;
        side?: Side;
        sideOffset?: number;
        align?: Align;
        alignOffset?: number;
        arrowPadding?: number;
        avoidCollisions?: boolean;
        collisionBoundary?: Boundary | Boundary[];
        collisionPadding?: number | Partial<Record<Side, number>>;
        sticky?: "partial" | "always";
        hideWhenDetached?: boolean;
        updatePositionStrategy?: "optimized" | "always";
        asChild?: boolean;
        contentAsChild?: boolean;
        forceMount?: true;
    }
>((props, forwardedRef) => {
    const {
        open,
        defaultOpen,
        onOpenChange,
        delayDuration,
        content,
        disableHoverableContent,
        container,
        side,
        sideOffset = 6,
        align,
        alignOffset,
        arrowPadding,
        avoidCollisions,
        collisionBoundary,
        collisionPadding = 6,
        sticky,
        hideWhenDetached,
        updatePositionStrategy,
        asChild,
        contentAsChild,
        forceMount,
        children,
        ...rest
    } = props;

    if (content == null || content === "") {
        const Comp = asChild ? Slot : "button";
        return (
            <Comp ref={forwardedRef} {...rest}>
                {children}
            </Comp>
        );
    }
    return (
        <Tooltip.Root
            open={open}
            defaultOpen={defaultOpen}
            onOpenChange={onOpenChange}
            delayDuration={delayDuration}
            disableHoverableContent={disableHoverableContent}
        >
            <Tooltip.Trigger ref={forwardedRef} asChild={asChild}>
                {children}
            </Tooltip.Trigger>
            <Tooltip.Portal container={container} forceMount={forceMount}>
                <Tooltip.Content
                    side={side}
                    sideOffset={sideOffset}
                    align={align}
                    alignOffset={alignOffset}
                    arrowPadding={arrowPadding}
                    avoidCollisions={avoidCollisions}
                    collisionBoundary={collisionBoundary}
                    collisionPadding={collisionPadding}
                    sticky={sticky}
                    hideWhenDetached={hideWhenDetached}
                    updatePositionStrategy={updatePositionStrategy}
                    className={cn(
                        "animate-popover border-default bg-background-translucent backdrop-blur max-w-xs rounded-lg border p-2 text-xs leading-none will-change-[transform,opacity] shadow-sm",
                        props.className,
                    )}
                    asChild={contentAsChild}
                    forceMount={forceMount}
                >
                    {content}
                </Tooltip.Content>
            </Tooltip.Portal>
        </Tooltip.Root>
    );
});

FernTooltip.displayName = "FernTooltip";

export const FernTooltipProvider = Tooltip.Provider;
