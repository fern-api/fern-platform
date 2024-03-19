import cn from "clsx";
import Link, { LinkProps } from "next/link";
import { DetailedHTMLProps, forwardRef, HTMLAttributes, PropsWithChildren } from "react";

interface FernCardProps {
    className?: string;
}

export const FernLinkCard = forwardRef<HTMLAnchorElement, PropsWithChildren<FernCardProps & LinkProps>>(
    function FernLinkCard({ children, className, ...props }, ref) {
        return (
            <Link className={cn("fern-card interactive", className)} {...props} ref={ref}>
                {children}
            </Link>
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
