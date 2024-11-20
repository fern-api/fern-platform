import { VariantProps, cva } from "class-variance-authority";
import { ComponentPropsWithoutRef, forwardRef } from "react";

export type IntentColorScheme = "blue" | "green" | "amber" | "red";
export type AdditionalColorScheme = "sky" | "bronze" | "purple" | "orange";
export type GrayscaleColorScheme = "gray" | "mauve" | "slate" | "sage" | "olive" | "sand";
export type AccentColorScheme = "accent";
export type ColorScheme = IntentColorScheme | GrayscaleColorScheme | AdditionalColorScheme | AccentColorScheme;
export type ConfigurableColorScheme = IntentColorScheme | AdditionalColorScheme | AccentColorScheme | "gray";

const badgeVariants = cva("fern-docs-badge", {
    variants: {
        size: {
            sm: "small",
            lg: "large",
        },
        color: {
            accent: "accent",
            blue: "blue",
            green: "green",
            amber: "amber",
            red: "red",
            gray: "gray",
            sky: "sky",
            bronze: "bronze",
            purple: "purple",
            orange: "orange",
        },
        variant: {
            subtle: "subtle",
            solid: "solid",
            outlined: "outlined",
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
    },
});

export type BadgeProps = VariantProps<typeof badgeVariants> & ComponentPropsWithoutRef<"span"> & { skeleton?: boolean };

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>((props, ref) => {
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
        ...rest
    } = props;
    let interactive = _interactive;

    if (
        rest.onClick ||
        rest.onMouseEnter ||
        rest.onMouseDown ||
        rest.onMouseMove ||
        rest.onMouseOver ||
        rest.onClickCapture ||
        rest.onMouseDownCapture ||
        rest.onMouseMoveCapture ||
        rest.onMouseOverCapture ||
        rest.onPointerEnter ||
        rest.onPointerDown ||
        rest.onPointerMove ||
        rest.onPointerOver ||
        rest.onPointerOverCapture ||
        rest.onPointerDownCapture ||
        rest.onPointerMoveCapture ||
        rest.onDoubleClick ||
        rest.onDoubleClickCapture
    ) {
        interactive = true;
    }

    return (
        <span
            ref={ref}
            {...rest}
            className={badgeVariants({ size, variant, color, grayscale, rounded, interactive, className })}
        >
            {skeleton ? <span style={{ visibility: "hidden", display: "contents" }}>{children}</span> : children}
        </span>
    );
});

Badge.displayName = "Badge";
