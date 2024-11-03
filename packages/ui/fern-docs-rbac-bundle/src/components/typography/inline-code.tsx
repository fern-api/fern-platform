import clsx from "clsx";
import { ComponentPropsWithoutRef, forwardRef } from "react";

export const InlineCode = forwardRef<HTMLSpanElement, ComponentPropsWithoutRef<"code">>(
    ({ children, ...props }, ref) => {
        return (
            <code
                {...props}
                className={clsx(
                    "relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold",
                    props.className,
                )}
                ref={ref}
            >
                {children}
            </code>
        );
    },
);

InlineCode.displayName = "InlineCode";
