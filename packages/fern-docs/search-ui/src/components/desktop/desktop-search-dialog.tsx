import {
  ComponentPropsWithoutRef,
  PropsWithChildren,
  ReactNode,
  memo,
} from "react";

import * as Dialog from "@radix-ui/react-dialog";
import { TooltipPortal } from "@radix-ui/react-tooltip";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { X } from "lucide-react";

import { Button } from "@fern-docs/components/button";

import {
  FERN_SEARCH_DIALOG_ID,
  FERN_SEARCH_DIALOG_OVERLAY_ID,
} from "../../constants";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { DesktopCommandAfterInput } from "./desktop-command";

function DialogCloseEsc({ className }: { className?: string }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Dialog.DialogClose asChild>
            <Button
              size="xs"
              variant="outline"
              className={className}
              aria-label="Close search"
            >
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
  );
}

function DialogCloseX({ className }: { className?: string }) {
  return (
    <Dialog.DialogClose asChild>
      <Button
        size="icon"
        variant="outline"
        className={className}
        aria-label="Close search"
      >
        <X />
      </Button>
    </Dialog.DialogClose>
  );
}
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
            <>
              <DialogCloseEsc className="pointer-coarse:hidden shrink-0" />
              <DialogCloseX className="pointer-coarse:flex hidden shrink-0" />
            </>
          )}
        </DesktopCommandAfterInput>

        <Dialog.Portal>
          <Dialog.Overlay id={FERN_SEARCH_DIALOG_OVERLAY_ID} />

          <VisuallyHidden>
            <Dialog.Title>Search</Dialog.Title>
            <Dialog.Description>Search our documentation.</Dialog.Description>
          </VisuallyHidden>

          <Dialog.Content
            id={FERN_SEARCH_DIALOG_ID}
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
