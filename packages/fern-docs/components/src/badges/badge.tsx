import { Slot } from "@radix-ui/react-slot";
import { VariantProps, cva } from "class-variance-authority";
import { ComponentPropsWithoutRef, forwardRef } from "react";

const badgeVariants = cva("fern-docs-badge", {
    variants: {
        size: {
            sm: "small",
            lg: "large",
        },
        color: {
            accent: "accent",
            gray: "gray",
            tomato: "tomato",
            red: "red",
            ruby: "ruby",
            crimson: "crimson",
            pink: "pink",
            plum: "plum",
            purple: "purple",
            violet: "violet",
            iris: "iris",
            indigo: "indigo",
            blue: "blue",
            cyan: "cyan",
            teal: "teal",
            jade: "jade",
            green: "green",
            grass: "grass",
            bronze: "bronze",
            gold: "gold",
            brown: "brown",
            orange: "orange",
            amber: "amber",
            yellow: "yellow",
            lime: "lime",
            mint: "mint",
            sky: "sky",
        },
        variant: {
            subtle: "subtle",
            solid: "solid",
            outlined: "outlined",
            "outlined-subtle": "outlined-subtle",
        },
        rounded: {
            true: "rounded",
        },
        interactive: {
            true: "interactive",
        },
        grayscale: {
            gray: false,
            mauve: false,
            slate: false,
            sage: false,
            olive: false,
            sand: false,
        },
    },
    compoundVariants: [
        {
            color: "gray",
            grayscale: "gray",
            className: "gray",
        },
        {
            color: "gray",
            grayscale: "mauve",
            className: "mauve",
        },
        {
            color: "gray",
            grayscale: "slate",
            className: "slate",
        },
        {
            color: "gray",
            grayscale: "sage",
            className: "sage",
        },
        {
            color: "gray",
            grayscale: "olive",
            className: "olive",
        },
        {
            color: "gray",
            grayscale: "sand",
            className: "sand",
        },
    ],
    defaultVariants: {
        size: "lg",
        variant: "subtle",
        color: "gray",
    },
});

export type BadgeProps = VariantProps<typeof badgeVariants> &
    ComponentPropsWithoutRef<"span" | "button"> & {
        skeleton?: boolean;
        asChild?: boolean;
    };

export const Badge = forwardRef<
    HTMLSpanElement & HTMLButtonElement,
    BadgeProps
>((props, ref) => {
    const {
        className,
        size,
        variant,
        color,
        grayscale,
        rounded,
        children,
        interactive: _interactive,
        skeleton,
        asChild,
        ...rest
    } = props;

    let interactive = _interactive;

    if (
        props.onClick ||
        props.onClickCapture ||
        props.onDoubleClick ||
        props.onDoubleClickCapture
    ) {
        interactive ??= true;
    }

    const Comp = asChild ? Slot : interactive ? "button" : "span";

    return (
        <Comp
            ref={ref}
            {...rest}
            className={badgeVariants({
                size,
                variant,
                color,
                grayscale,
                rounded,
                interactive,
                className,
            })}
        >
            {skeleton ? (
                <span style={{ visibility: "hidden", display: "contents" }}>
                    {children}
                </span>
            ) : (
                children
            )}
        </Comp>
    );
});

Badge.displayName = "Badge";
