import cn from "clsx";
import { ComponentProps, ReactElement } from "react";

export function StepGroup({
    children,
    className,
    ...props
}: ComponentProps<"div">): ReactElement {
    return (
        <div className={cn("fern-steps", className)} {...props}>
            {children}
        </div>
    );
}
