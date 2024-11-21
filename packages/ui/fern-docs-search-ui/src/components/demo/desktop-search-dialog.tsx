import { cn } from "@/components/ui/cn";
import * as Dialog from "@radix-ui/react-dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { SearchIcon } from "lucide-react";
import { Kbd } from "../ui/kbd";

export function DesktopSearchDialog({
    desktopDialogOpen,
    setDesktopDialogOpen,
    children,
}: {
    desktopDialogOpen: boolean;
    setDesktopDialogOpen: (open: boolean) => void;
    children: React.ReactNode;
}): React.ReactElement {
    return (
        <Dialog.Root open={desktopDialogOpen} onOpenChange={setDesktopDialogOpen}>
            <Dialog.Trigger asChild>
                <button
                    className={cn(
                        "inline-flex items-center justify-start gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
                        "border border-input bg-background hover:bg-accent",
                        "h-9 px-2 py-2",
                        "w-full",
                    )}
                >
                    <SearchIcon />
                    Search
                    <Kbd className="ml-auto">⌘K</Kbd>
                </button>
            </Dialog.Trigger>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-background/80 backdrop-blur-md" />

                <VisuallyHidden>
                    <Dialog.Title>Search</Dialog.Title>
                    <Dialog.Description>Search our documentation.</Dialog.Description>
                </VisuallyHidden>

                <Dialog.Content
                    className="fixed top-[15%] left-1/2 w-[640px] -translate-x-1/2 shadow-xl overflow-hidden origin-left outline-none"
                    asChild
                >
                    {children}
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}
