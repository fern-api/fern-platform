import cn from "clsx";
import { LinkProps } from "next/link";
import { DetailedHTMLProps, forwardRef, HTMLAttributes, PropsWithChildren } from "react";
import { FernLink } from "./FernLink";

interface FernCardProps {
    className?: string;
}

export const FernLinkCard = forwardRef<HTMLAnchorElement, PropsWithChildren<FernCardProps & LinkProps>>(
    function FernLinkCard({ children, className, ...props }, ref) {
        return (
            <FernLink className={cn("fern-card interactive", className)} {...props} ref={ref}>
                {children}
            </FernLink>
        );
    },
);

export const FernCard = forwardRef<HTMLDivElement, DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>>(
    function FernCard({ children, className, ...props }, ref) {
        return (
            <div
                className={cn(
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
    },
);
