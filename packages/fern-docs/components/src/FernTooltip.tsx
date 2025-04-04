"use client";

import { FC, ReactNode } from "react";

import * as Tooltip from "@radix-ui/react-tooltip";

import { cn } from "./cn";

interface FernTooltipProps
  extends Tooltip.TooltipProps,
    Omit<Tooltip.TooltipContentProps, "content"> {
  content: ReactNode | undefined;
  container?: HTMLElement | null;
}

export const FernTooltip: FC<FernTooltipProps> = ({
  content,
  children,
  open,
  defaultOpen,
  onOpenChange,
  delayDuration,
  disableHoverableContent,
  container,
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
      <Tooltip.Portal container={container}>
        <Tooltip.Content
          sideOffset={6}
          collisionPadding={6}
          {...props}
          className={cn(
            "bg-background border-border-default animate-popover rounded-2 shadow-card-grayscale z-50 max-w-xs border p-2 text-sm leading-normal backdrop-blur will-change-[transform,opacity]",
            props.className
          )}
        >
          {content}
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
};

export const FernTooltipProvider = Tooltip.Provider;
