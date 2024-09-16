import { FernCardProps } from "@fern-ui/components";
import clsx from "clsx";
import { LinkProps } from "next/link";
import { forwardRef, PropsWithChildren } from "react";
import { FernLink } from "./FernLink";

export const FernLinkCard = forwardRef<HTMLAnchorElement, PropsWithChildren<FernCardProps & LinkProps>>(
    function FernLinkCard({ children, className, ...props }, ref) {
        return (
            <FernLink className={clsx("fern-card interactive", className)} {...props} ref={ref}>
                {children}
            </FernLink>
        );
    },
);
