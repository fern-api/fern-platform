import clsx from "clsx";
import { ComponentProps, forwardRef } from "react";

export interface FernCardProps {
    className?: string;
}

export const FernCard = forwardRef<HTMLDivElement, ComponentProps<"div">>(function FernCard(
    { children, className, ...props },
    ref,
) {
    return (
        <div
            className={clsx(
                "fern-card",
                {
                    interactive: props.onClick != null || props.onClickCapture != null,
                },
                className,
            )}
            {...props}
            ref={ref}
        >
            {children}
        </div>
    );
});
