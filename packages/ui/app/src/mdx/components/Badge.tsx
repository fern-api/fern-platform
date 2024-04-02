import cn from "clsx";
import React, { ReactElement } from "react";

export declare namespace Badge {
    export type Props = React.PropsWithChildren<{
        intent?: "none" | "primary" | "success" | "warning" | "danger"; // from FernButton
        className?: string;
        minimal?: boolean;
        outlined?: boolean;
    }>;
}

export function Badge({
    className,
    intent = "none",
    minimal = false,
    outlined = false,
    children,
}: Badge.Props): ReactElement {
    return (
        <span
            className={cn(
                "rounded-full text-xs px-1.5 py-0.5",
                {
                    border: outlined,
                    "text-white dark:text-black": !minimal && intent !== "primary",
                    "bg-intent-default": intent === "none",
                    "bg-accent-primary text-accent-primary-contrast": intent === "primary",
                    "bg-intent-success": intent === "success",
                    "bg-intent-warning": intent === "warning",
                    "bg-intent-danger": intent === "danger",
                    "bg-tag-default t-default": intent === "none" && minimal,
                    "border-default": intent === "none" && outlined,
                    "bg-tag-primary t-accent ": intent === "primary" && !minimal,
                    "border-primary": intent === "primary" && outlined,
                    "bg-tag-success t-success": intent === "success" && !minimal,
                    "border-success": intent === "success" && outlined,
                    "bg-tag-warning t-warning": intent === "warning" && !minimal,
                    "border-warning": intent === "warning" && outlined,
                    "bg-tag-danger t-danger": intent === "danger" && !minimal,
                    "border-danger": intent === "danger" && outlined,
                },
                className,
            )}
        >
            {children}
        </span>
    );
}
