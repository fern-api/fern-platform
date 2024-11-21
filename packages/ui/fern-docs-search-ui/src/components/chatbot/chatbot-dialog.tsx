import { composeRefs } from "@radix-ui/react-compose-refs";
import * as Dialog from "@radix-ui/react-dialog";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { ArrowUp, X } from "lucide-react";
import { PropsWithChildren, ReactElement, forwardRef, useEffect, useRef } from "react";
import { Button } from "../ui/button";
import { TextArea } from "../ui/textarea";

interface ChatbotDialogProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    defaultOpen?: boolean;
    modal?: boolean;
}

export function ChatbotDialog({
    children,
    open,
    onOpenChange,
    defaultOpen,
    modal,
}: PropsWithChildren<ChatbotDialogProps>): ReactElement {
    const inputRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.defaultPrevented) {
                return;
            }

            if (event.key === "Escape") {
                return;
            }

            inputRef.current?.focus();
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [inputRef, onOpenChange]);

    return (
        <Dialog.Root open={open} onOpenChange={onOpenChange} defaultOpen={defaultOpen} modal={modal}>
            {children && <Dialog.Trigger asChild>{children}</Dialog.Trigger>}
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-background/80 backdrop-blur-md" />
                <Dialog.Content className="fixed inset-0 flex flex-col items-stretch">
                    <VisuallyHidden.Root>
                        <Dialog.Title>Ask AI</Dialog.Title>
                        <Dialog.Description>Ask AI any questions you have about our documentation.</Dialog.Description>
                    </VisuallyHidden.Root>
                    <div className="overflow-scroll overscroll-contain flex-1">
                        <div className="max-w-3xl w-screen mx-auto"></div>
                    </div>
                    <div className="max-w-3xl w-screen mx-auto shrink-0">
                        <Composer ref={inputRef} />
                    </div>
                    <div className="relative w-full p-2 text-center text-xs text-muted-foreground empty:hidden md:px-[60px]">
                        <div className="h-2" />
                    </div>
                    <Dialog.Close asChild className="fixed top-2 right-2 z-10">
                        <Button variant="outline" size="icon" className="rounded-full">
                            <X />
                        </Button>
                    </Dialog.Close>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}

const Composer = forwardRef<HTMLTextAreaElement>((_, ref) => {
    const inputRef = useRef<HTMLTextAreaElement>(null);

    return (
        <div
            className="flex w-full cursor-text flex-col rounded-3xl px-2.5 py-1 transition-colors contain-inline-size bg-[var(--gray-a2)]"
            onClick={() => inputRef.current?.focus()}
        >
            <div className="flex min-h-[44px] items-center px-2">
                <TextArea
                    ref={composeRefs(ref, inputRef)}
                    className="w-full px-0 py-2 m-0 resize-none text-grayscale-12 placeholder:text-grayscale-a10 border-0 bg-transparent focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 max-h-52"
                    placeholder="Ask AI anything about our documentation"
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                            // submit the form
                        }
                    }}
                />
            </div>
            <div className="flex h-[44px] items-center justify-between">
                <div></div>
                <button className="p-1 rounded-full hover:bg-[var(--gray-a4)] transition-colors">
                    <ArrowUp />
                </button>
            </div>
        </div>
    );
});

Composer.displayName = "Composer";
