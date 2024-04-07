import cn from "clsx";
import { ComponentProps, ReactElement } from "react";
import "./Steps.css";

export function Steps({ children, className, ...props }: ComponentProps<"div">): ReactElement {
    return (
        <div className={cn("fern-steps", className)} {...props}>
            {children}
        </div>
    );
}
