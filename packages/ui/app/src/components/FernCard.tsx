import classNames from "classnames";
import Link, { LinkProps } from "next/link";
import { DetailedHTMLProps, forwardRef, HTMLAttributes, PropsWithChildren } from "react";
import "./FernCard.scss";

interface FernCardProps {
    className?: string;
}

export const FernLinkCard = forwardRef<HTMLAnchorElement, PropsWithChildren<FernCardProps & LinkProps>>(
    function FernLinkCard({ children, className, ...props }, ref) {
        return (
            <Link className={classNames("fern-card interactive", className)} {...props} ref={ref}>
                {children}
            </Link>
        );
    },
);

export const FernCard = forwardRef<HTMLDivElement, DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>>(
    function FernCard({ children, className, ...props }, ref) {
        return (
            <div
                className={classNames(
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
