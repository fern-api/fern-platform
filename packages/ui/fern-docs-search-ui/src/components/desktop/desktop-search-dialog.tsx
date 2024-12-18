import { Button } from "@fern-ui/components/button";
import * as Dialog from "@radix-ui/react-dialog";
import { TooltipPortal } from "@radix-ui/react-tooltip";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { ComponentPropsWithoutRef, PropsWithChildren, ReactNode, memo } from "react";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { DesktopCommandAfterInput } from "./desktop-command";
import { DesktopSearchButton } from "./desktop-search-button";

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
                <Dialog.Trigger asChild>{trigger ?? <DesktopSearchButton />}</Dialog.Trigger>

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
                    <Dialog.Overlay data-cmdk-dialog-overlay="" />

                    <VisuallyHidden>
                        <Dialog.Title>Search</Dialog.Title>
                        <Dialog.Description>Search our documentation.</Dialog.Description>
                    </VisuallyHidden>

                    <Dialog.Content
                        data-cmdk-dialog-content=""
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
    },
);

DesktopSearchDialog.displayName = "DesktopSearchDialog";
