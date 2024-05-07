import cn from "clsx";
import { PropsWithChildren, ReactElement } from "react";

interface FernTagProps extends PropsWithChildren {
    className?: string;
    intent?: "none" | "success" | "warning" | "danger" | "accent";
}

export function FernTag({ children, className, intent = "none" }: FernTagProps): ReactElement {
    return (
        <span
            className={cn(
                "font-mono inline-flex justify-center items-center leading-none",
                {
                    ["bg-tag-default text-default"]: intent === "none",
                    ["bg-tag-success text-intent-success"]: intent === "success",
                    ["bg-tag-warning text-intent-warning"]: intent === "warning",
                    ["bg-tag-danger text-intent-danger"]: intent === "danger",
                    ["bg-accent/10 text-accent-aaa"]: intent === "accent",
                    ["py-1 px-2 rounded-lg h-6 text-xs"]: true,
                },
                className,
            )}
        >
            {children}
        </span>
    );
}
