import clsx from "clsx";
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
            className={clsx(
                "rounded-full px-1.5 py-0.5 text-xs",
                {
                    "ring-1 ring-inset": outlined,
                    "text-white dark:text-black": !minimal && intent !== "primary",
                    "ring-black/30 dark:ring-white/30": outlined,
                    "bg-intent-default": intent === "none",
                    "bg-accent text-accent-contrast": intent === "primary" && !minimal,
                    "bg-intent-success": intent === "success" && !minimal,
                    "bg-intent-warning": intent === "warning" && !minimal,
                    "bg-intent-danger": intent === "danger" && !minimal,
                    "bg-tag-default t-default": intent === "none" && minimal,
                    "ring-border-default": intent === "none" && minimal && outlined,
                    "bg-tag-primary t-accent": intent === "primary" && minimal,
                    "ring-border-primary": intent === "primary" && minimal && outlined,
                    "bg-tag-success t-success": intent === "success" && minimal,
                    "ring-border-success": intent === "success" && minimal && outlined,
                    "bg-tag-warning t-warning": intent === "warning" && minimal,
                    "ring-border-warning": intent === "warning" && minimal && outlined,
                    "bg-tag-danger t-danger": intent === "danger" && minimal,
                    "ring-border-danger": intent === "danger" && minimal && outlined,
                },
                className,
            )}
        >
            {children}
        </span>
    );
}
