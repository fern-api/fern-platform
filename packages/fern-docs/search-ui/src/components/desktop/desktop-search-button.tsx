import { Kbd } from "@fern-docs/components";
import { VariantProps, cva } from "class-variance-authority";
import { SearchIcon } from "lucide-react";
import { ComponentPropsWithoutRef, forwardRef, memo } from "react";
import { cn } from "../ui/cn";

const buttonVariants = cva(
    "inline-flex items-center justify-start gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors hover:transition-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent-6)] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 h-9 p-2 w-full cursor-text",
    {
        variants: {
            variant: {
                default:
                    "bg-[var(--grayscale-a3)] text-[var(--grayscale-a10)] hover:bg-[var(--grayscale-a4)]",
                loading:
                    "bg-[var(--grayscale-a3)] text-[var(--grayscale-a10)] cursor-default",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
);

export const DesktopSearchButton = forwardRef<
    HTMLButtonElement,
    ComponentPropsWithoutRef<"button"> & VariantProps<typeof buttonVariants>
>(({ children, variant, className, ...rest }, ref) => {
    return (
        <button
            {...rest}
            className={buttonVariants({ variant, className })}
            ref={ref}
        >
            <SearchIcon />
            Search
            <CommandKbd className="ml-auto" />
        </button>
    );
});

DesktopSearchButton.displayName = "DesktopSearchButton";

export const CommandKbd = memo(({ className }: { className?: string }) => {
    return (
        <span className={cn("inline-flex gap-1", className)}>
            <Kbd>{"/"}</Kbd>
            {/* <Kbd>{shortcut}</Kbd>
            <Kbd>K</Kbd> */}
        </span>
    );
});

CommandKbd.displayName = "CommandKbd";
