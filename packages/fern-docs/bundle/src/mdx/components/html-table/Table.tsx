"use client";

import { ComponentProps, useState } from "react";

import * as Dialog from "@radix-ui/react-dialog";
import * as Tooltip from "@radix-ui/react-tooltip";
import { Expand } from "lucide-react";

import { cn } from "@fern-docs/components";
import { FernButton, FernScrollArea } from "@fern-docs/components";

export function Table({ className, ...rest }: ComponentProps<"table">) {
  const [isFullScreen, setIsFullScreen] = useState(false);

  return (
    <>
      <Tooltip.TooltipProvider delayDuration={300}>
        <Tooltip.Root>
          <Tooltip.Trigger asChild>
            <div className="fern-table-root not-prose">
              <FernScrollArea>
                <table {...rest} className={cn("fern-table", className)} />
              </FernScrollArea>
            </div>
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content
              side="right"
              align="start"
              sideOffset={6}
              className="animate-popover"
            >
              <FernButton
                variant="outlined"
                icon={<Expand />}
                onClick={() => setIsFullScreen(true)}
              />
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>
      </Tooltip.TooltipProvider>
      <Dialog.Root open={isFullScreen} onOpenChange={setIsFullScreen}>
        <Dialog.Portal>
          <Dialog.Overlay className="bg-background/50 data-[state=open]:animate-overlay-show fixed inset-0 z-50 backdrop-blur-sm" />
          <Dialog.Content
            className="fixed inset-x-0 top-1/2 z-50 mx-auto flex max-h-[calc(100vh-2rem)] -translate-y-1/2 flex-col md:inset-x-4 md:max-h-[calc(100vh-8rem)] lg:inset-x-16 xl:inset-x-32"
            asChild
          >
            <div className="fern-table-root not-prose fullscreen">
              <FernScrollArea>
                <table {...rest} className={cn("fern-table", className)} />
              </FernScrollArea>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
