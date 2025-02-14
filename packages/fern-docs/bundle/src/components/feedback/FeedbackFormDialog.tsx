import { FC } from "react";

import * as Popover from "@radix-ui/react-popover";

import { cn } from "@fern-docs/components";

export interface FeedbackFormDialogProps extends Popover.PopoverProps {
  trigger: React.ReactNode;
  content: React.ReactNode;
  className?: string;
}

export const FeedbackFormDialog: FC<FeedbackFormDialogProps> = ({
  trigger,
  content,
  className,
  ...props
}) => {
  return (
    <Popover.Root {...props}>
      <Popover.Trigger asChild>{trigger}</Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          side="bottom"
          sideOffset={8}
          className={cn(
            "border-default dark:bg-background/50 z-50 w-[calc(100vw-32px)] rounded-lg border bg-white/50 p-4 shadow-xl backdrop-blur-xl sm:w-96",
            "data-[state=open]:data-[side=bottom]:animate-slide-up-and-fade data-[state=open]:data-[side=left]:animate-slide-right-and-fade data-[state=open]:data-[side=right]:animate-slide-left-and-fade data-[state=open]:data-[side=top]:animate-slide-down-and-fade will-change-[transform,opacity]",
            className
          )}
        >
          {content}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};
