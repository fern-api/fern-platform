import { clsx } from "clsx";
import { FC, PropsWithChildren } from "react";
import { ColorScheme, Size } from "../util/shared-component-types";

export type FernTagSize = Extract<Size, "sm" | "lg">;
export const FernTagSizes: { [key: string]: FernTagSize } = {
    Small: "sm",
    Large: "lg",
};

export type FernTagColorScheme = ColorScheme;
export const FernTagColorSchemes: { [key: string]: FernTagColorScheme } = {
    Gray: "gray",
    Green: "green",
    Blue: "blue",
    Amber: "amber",
    Red: "red",
    Accent: "accent",
};

export interface FernTagProps extends PropsWithChildren {
    size?: FernTagSize;
    variant?: "subtle" | "solid";
    colorScheme?: FernTagColorScheme;
    className?: string;
}

/**
 * The `FernTag` component is used for items that need to be labeled, categorized, or organized using keywords that describe them.
 */
export const FernTag: FC<FernTagProps> = ({
    children,
    size = "lg",
    variant = "subtle",
    colorScheme = "gray",
    className,
}) => {
    return (
        <div
            className={clsx(
                "font-mono inline-flex justify-center items-center leading-none",
                {
                    "rounded-md h-[18px] text-[10px] px-1.5": size === "sm",
                    "py-1 px-2 rounded-lg h-6 text-xs": size === "lg",
                },
                {
                    // Gray
                    "bg-tag-default text-default": colorScheme === "gray" && variant === "subtle",
                    "bg-tag-default-inverted text-text-default-inverted": colorScheme === "gray" && variant === "solid",

                    // Green
                    "bg-tag-success text-intent-success": colorScheme === "green" && variant === "subtle",
                    "bg-method-get text-background": colorScheme === "green" && variant === "solid",

                    // Blue
                    "bg-tag-info text-intent-info": colorScheme === "blue" && variant === "subtle",
                    "bg-method-post text-background": colorScheme === "blue" && variant === "solid",

                    // Amber
                    "bg-tag-warning text-intent-warning": colorScheme === "amber" && variant === "subtle",
                    "bg-intent-warning text-background": colorScheme === "amber" && variant === "solid",

                    // Red
                    "bg-tag-danger text-intent-danger": colorScheme === "red" && variant === "subtle",
                    "bg-method-delete text-background": colorScheme === "red" && variant === "solid",

                    // Accent
                    "bg-accent/10 text-accent-aaa": colorScheme === "accent" && variant === "subtle",
                    "bg-accent t-accent-contrast": colorScheme === "accent" && variant === "solid",
                },
                className,
            )}
        >
            {children}
        </div>
    );
};
