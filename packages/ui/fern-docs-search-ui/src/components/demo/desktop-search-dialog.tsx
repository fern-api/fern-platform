import { cn } from "@/components/ui/cn";
import * as Dialog from "@radix-ui/react-dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { SearchIcon } from "lucide-react";
import { Kbd } from "../ui/kbd";

export function DesktopSearchDialog({
    open,
    onOpenChange,
    children,
    asChild,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    children: React.ReactNode;
    asChild?: boolean;
}): React.ReactElement {
    return (
        <Dialog.Root open={open} onOpenChange={onOpenChange}>
            <Dialog.Trigger asChild>
                <button
                    className={cn(
                        "inline-flex items-center justify-start gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
                        "border border-input bg-[var(--grayscale-a1)] hover:bg-[var(--grayscale-a2)] text-[var(--grayscale-a10)]",
                        "h-9 px-2 py-2",
                        "w-full",
                    )}
                >
                    <SearchIcon />
                    Search
                    <Kbd className="ml-auto tracking-widest">⌘+K</Kbd>
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
