import { Button } from "@fern-docs/components/button";
import * as Dialog from "@radix-ui/react-dialog";
import { TooltipPortal } from "@radix-ui/react-tooltip";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import {
  ComponentPropsWithoutRef,
  PropsWithChildren,
  ReactNode,
  memo,
} from "react";

import { cn } from "../ui/cn";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { DesktopCommandAfterInput } from "./desktop-command";

export const DesktopSearchDialog = memo(
  ({
    children,
    asChild,
    trigger,
    afterInput,
    ...rest
  }: PropsWithChildren<
    {
      trigger?: ReactNode;
      asChild?: boolean;
      afterInput?: ReactNode;
    } & ComponentPropsWithoutRef<typeof Dialog.Root>
  >) => {
    return (
      <Dialog.Root {...rest}>
        {trigger}

        <DesktopCommandAfterInput>
          {afterInput || (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Dialog.DialogClose asChild>
                    <Button size="xs" variant="outline">
                      <kbd>Esc</kbd>
                    </Button>
                  </Dialog.DialogClose>
                </TooltipTrigger>
                <TooltipPortal>
                  <TooltipContent>
                    <p>Close search</p>
                  </TooltipContent>
                </TooltipPortal>
              </Tooltip>
            </TooltipProvider>
          )}
        </DesktopCommandAfterInput>

        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-[var(--white-a3)] backdrop-blur-md dark:bg-[var(--black-a3)]" />

          <VisuallyHidden>
            <Dialog.Title>Search</Dialog.Title>
            <Dialog.Description>Search our documentation.</Dialog.Description>
          </VisuallyHidden>

          <Dialog.Content
            className={cn(
              "fixed left-1/2 top-[15%] w-[640px] origin-center -translate-x-1/2 outline-none"
            )}
            asChild={asChild}
            onEscapeKeyDown={(e) => {
              e.preventDefault();
            }}
          >
            {children}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    );
  }
);

DesktopSearchDialog.displayName = "DesktopSearchDialog";
