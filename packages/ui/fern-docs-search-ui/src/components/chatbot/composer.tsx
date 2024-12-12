import { composeRefs } from "@radix-ui/react-compose-refs";
import { Slot } from "@radix-ui/react-slot";
import { ArrowUp } from "lucide-react";
import { ComponentPropsWithoutRef, forwardRef, useRef } from "react";
import { TextArea } from "../ui/textarea";

export const Composer = forwardRef<
    HTMLTextAreaElement,
    Omit<ComponentPropsWithoutRef<typeof TextArea>, "className"> & {
        onSubmit: (e: { preventDefault: () => void }) => void;
        asChild?: boolean;
    }
>(({ onSubmit, children, asChild, ...props }, ref) => {
    const inputRef = useRef<HTMLTextAreaElement>(null);

    const Comp = asChild ? Slot : "div";

    return (
        <div
            className="flex w-full cursor-text flex-col rounded-3xl px-2.5 py-1 transition-colors contain-inline-size bg-[var(--grayscale-a3)]"
            onClick={() => inputRef.current?.focus()}
        >
            <div className="flex min-h-[44px] items-center px-2">
                <TextArea
                    ref={composeRefs(ref, inputRef)}
                    placeholder="Ask AI anything about our documentation"
                    {...props}
                    className="w-full px-0 py-2 m-0 resize-none text-grayscale-12 placeholder:text-grayscale-a10 border-0 bg-transparent focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 max-h-52 placeholder:text-[var(--grayscale-a9)]"
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                            onSubmit(e);
                        }
                    }}
                />
            </div>
            <div className="flex h-[44px] items-center justify-between">
                <Comp>{children}</Comp>
                <button
                    className="p-1 rounded-full hover:bg-[var(--gray-a4)] transition-colors disabled:opacity-50 disabled:pointer-events-none"
                    onClick={onSubmit}
                    disabled={!props.value}
                >
                    <ArrowUp />
                </button>
            </div>
        </div>
    );
});

Composer.displayName = "Composer";
