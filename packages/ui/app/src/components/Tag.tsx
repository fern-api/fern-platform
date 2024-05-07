import { clsx } from "clsx";
import { FC, PropsWithChildren } from "react";

export interface TagProps extends PropsWithChildren {
    size?: "sm" | "lg";
    variant?: "subtle" | "solid";
    colorScheme?: "green" | "blue" | "yellow" | "red" | "accent";
    className?: string;
}

/**
 * The `Tag` component is used for items that need to be labeled, categorized, or organized using keywords that describe them.
 */
export const Tag: FC<TagProps> = ({ children, size = "lg", variant = "subtle", colorScheme = "accent", className }) => {
    return (
        <div
            className={clsx(
                "uppercase font-mono inline-flex justify-center items-center leading-none",
                {
                    "rounded-md h-[18px] text-[10px] px-1.5": size === "sm",
                    "py-1 px-2 rounded-lg h-6 text-xs": size === "lg",
                },
                {
                    // Green
                    "bg-tag-method-get text-text-method-get dark:text-method-get-dark":
                        colorScheme === "green" && variant === "subtle",
                    "bg-method-get text-text-default-inverted": colorScheme === "green" && variant === "solid",

                    // Blue
                    "bg-tag-method-post text-text-method-post": colorScheme === "blue" && variant === "subtle",
                    "bg-method-post text-text-default-inverted": colorScheme === "blue" && variant === "solid",

                    // Yellow
                    "bg-tag-method-put text-text-method-put": colorScheme === "yellow" && variant === "subtle",
                    "bg-method-put text-text-default-inverted": colorScheme === "yellow" && variant === "solid",

                    // Red
                    "bg-tag-method-delete text-text-method-delete": colorScheme === "red" && variant === "subtle",
                    "bg-method-delete text-text-default-inverted": colorScheme === "red" && variant === "solid",

                    // Accent
                    "bg-accent/10 dark:bg-accent-dark/10 text-accent-aaa":
                        colorScheme === "accent" && variant === "subtle",
                    "bg-accent dark:bg-accent-dark t-accent-contrast": colorScheme === "accent" && variant === "solid",
                },
                className,
            )}
        >
            {children}
        </div>
    );
};
