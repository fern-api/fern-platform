import clsx from "clsx";
import { ComponentProps, ReactElement } from "react";

export function StepGroup({ children, className, ...props }: ComponentProps<"div">): ReactElement {
    return (
        <div className={clsx("fern-steps", className)} {...props}>
            {children}
        </div>
    );
}
