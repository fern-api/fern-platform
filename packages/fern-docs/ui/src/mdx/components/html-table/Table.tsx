import { FernButton, FernScrollArea } from "@fern-docs/components";
import * as Dialog from "@radix-ui/react-dialog";
import * as Tooltip from "@radix-ui/react-tooltip";
import clsx from "clsx";
import { Expand } from "iconoir-react";
import { ComponentProps, FC, useState } from "react";

export const Table: FC<ComponentProps<"table">> = ({ className, ...rest }) => {
  const [isFullScreen, setIsFullScreen] = useState(false);

  return (
    <>
      <Tooltip.TooltipProvider delayDuration={300}>
        <Tooltip.Root>
          <Tooltip.Trigger asChild>
            <div className="fern-table-root not-prose">
              <FernScrollArea>
                <table {...rest} className={clsx("fern-table", className)} />
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
          <Dialog.Overlay className="fixed inset-0 bg-background/50 backdrop-blur-sm data-[state=open]:animate-overlay-show" />
          <Dialog.Content
            className="fixed left-1/2 top-1/2 flex max-h-[calc(100vh-2rem)] w-[calc(100vw-2rem)] -translate-x-1/2 -translate-y-1/2 flex-col data-[state=open]:animate-content-show md:max-h-[calc(100vh-8rem)] md:w-[calc(100vw-8rem)]"
            asChild
          >
            <div className="fern-table-root not-prose fullscreen">
              <FernScrollArea>
                <table {...rest} className={clsx("fern-table", className)} />
              </FernScrollArea>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
};
