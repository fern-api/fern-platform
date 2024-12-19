import * as Tooltip from "@radix-ui/react-tooltip";
import cn from "clsx";
import { FC, ReactNode } from "react";

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
            "animate-popover border-default bg-background-translucent backdrop-blur max-w-xs rounded-lg border p-2 text-xs leading-none will-change-[transform,opacity] shadow-sm",
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
