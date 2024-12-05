import { VariantProps, cva } from "class-variance-authority";
import { SearchIcon } from "lucide-react";
import { ComponentPropsWithoutRef, forwardRef } from "react";
import { Kbd } from "../ui/kbd";

const buttonVariants = cva(
    "inline-flex items-center justify-start gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent-6)] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 h-9 p-2 w-full",
    {
        variants: {
            variant: {
                default:
                    "border border-[var(--grayscale-a6)] bg-[var(--grayscale-a1)] text-[var(--grayscale-a10)] hover:bg-[var(--grayscale-a2)]",
                loading:
                    "border border-[var(--grayscale-a6)] bg-[var(--grayscale-a1)] text-[var(--grayscale-a10)] cursor-default",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    },
);

export const DesktopSearchButton = forwardRef<
    HTMLButtonElement,
    ComponentPropsWithoutRef<"button"> & VariantProps<typeof buttonVariants>
>(({ children, variant, className, ...rest }, ref) => {
    return (
        <button {...rest} className={buttonVariants({ variant, className })} ref={ref}>
            <SearchIcon />
            Search
            <Kbd className="ml-auto tracking-widest">⌘+K</Kbd>
        </button>
    );
});

DesktopSearchButton.displayName = "DesktopSearchButton";
