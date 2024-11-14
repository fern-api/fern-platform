import { forwardRef, type ComponentProps, type ForwardRefExoticComponent, type RefAttributes } from "react";
import { cn } from "./cn";

type KbdProps = ComponentProps<"kbd">;

export const Kbd: ForwardRefExoticComponent<KbdProps & RefAttributes<HTMLSpanElement>> = forwardRef<
    HTMLSpanElement,
    KbdProps
>((props, ref) => {
    return (
        <kbd
            ref={ref}
            {...props}
            className={cn(
                "bg-[#E5E5E5] dark:bg-[#2A2A2A] rounded-sm px-1 py-0.5 text-xs font-semibold font-mono",
                props.className,
            )}
        >
            {props.children}
        </kbd>
    );
});

Kbd.displayName = "Kbd";
