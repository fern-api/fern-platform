import * as Dialog from "@radix-ui/react-dialog";
import { TooltipPortal } from "@radix-ui/react-tooltip";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { ComponentPropsWithoutRef, PropsWithChildren, ReactNode, memo } from "react";
import { Button } from "../ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { DesktopCommandAfterInput } from "./desktop-command";
import { DesktopSearchButton } from "./desktop-search-button";

export const DesktopSearchDialog = memo(
    ({
        children,
        asChild,
        trigger,
        ...rest
    }: PropsWithChildren<
        {
            trigger?: ReactNode;
            asChild?: boolean;
        } & ComponentPropsWithoutRef<typeof Dialog.Root>
    >) => {
        return (
            <Dialog.Root {...rest}>
                <Dialog.Trigger asChild>{trigger ?? <DesktopSearchButton />}</Dialog.Trigger>
                <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 bg-[var(--grayscale-1)]/80 backdrop-blur-md" />

                    <VisuallyHidden>
                        <Dialog.Title>Search</Dialog.Title>
                        <Dialog.Description>Search our documentation.</Dialog.Description>
                    </VisuallyHidden>

                    <DesktopCommandAfterInput>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Dialog.DialogClose asChild>
                                        <Button size="xs" variant="outline">
                                            <kbd>esc</kbd>
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
                    </DesktopCommandAfterInput>

                    <Dialog.Content
                        className="fixed top-[15%] left-1/2 w-[640px] -translate-x-1/2 shadow-xl overflow-hidden origin-left outline-none"
                        asChild={asChild}
                        onEscapeKeyDown={(e) => {
                            e.preventDefault();
                        }}
                        onOpenAutoFocus={(e) => {
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
