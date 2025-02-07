import { FernLink } from "@/components/link";
import { FernCardProps } from "@fern-docs/components";
import cn from "clsx";
import { LinkProps } from "next/link";
import { forwardRef, PropsWithChildren } from "react";

export const FernLinkCard = forwardRef<
  HTMLAnchorElement,
  PropsWithChildren<FernCardProps & LinkProps>
>(function FernLinkCard({ children, className, ...props }, ref) {
  return (
    <FernLink
      className={cn("fern-card interactive", className)}
      {...props}
      ref={ref}
    >
      {children}
    </FernLink>
  );
});
