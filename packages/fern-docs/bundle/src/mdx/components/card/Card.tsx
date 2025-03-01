import { isValidElement } from "react";

import { cn } from "@fern-docs/components";
import { FaIcon, FernCard } from "@fern-docs/components";

import { DisableFernAnchor } from "@/components/FernAnchor";
import { FernLinkCard } from "@/components/FernLinkCard";

import { Badge } from "../badge";
import { NoZoom } from "../html/image";

export declare namespace Card {
  export interface Props {
    title: string;
    icon?: unknown;
    iconSize?: number; // size in 0.25rem increments. default is 4.
    color?: string; // ignored if lightModeColor and darkModeColor are set
    darkModeColor?: string;
    lightModeColor?: string;

    children?: string;
    href?: string;
    iconPosition?: "top" | "left";

    // in-development:
    badge?: string;
  }
}

export const Card: React.FC<Card.Props> = ({
  title,
  icon,
  iconSize = 8,
  color,
  darkModeColor,
  lightModeColor,
  iconPosition = "top",
  children,
  href,
  badge,
}) => {
  const className = cn(
    "not-prose rounded-3 relative block border p-6 text-base"
  );

  const content = (
    <>
      {badge != null && (
        <Badge intent="primary" className="absolute -right-2 -top-2">
          {badge}
        </Badge>
      )}
      <div
        className={cn("flex items-start", {
          "flex-col space-y-3": iconPosition === "top",
          "flex-row space-x-3": iconPosition === "left",
        })}
      >
        <style jsx>
          {`
            div > :global(.card-icon) {
              color: ${lightModeColor ?? color ?? "var(--accent-a10)"};
              width: ${iconSize * 4}px;
              height: ${iconSize * 4}px;
            }

            div > :global(.card-icon:is(.dark *)) {
              color: ${darkModeColor ?? color ?? "var(--accent-a10)"};
            }
          `}
        </style>
        {typeof icon === "string" ? (
          <FaIcon className="card-icon" icon={icon} />
        ) : isValidElement(icon) ? (
          <span className="card-icon">
            <NoZoom>{icon}</NoZoom>
          </span>
        ) : null}
        <div className="w-full space-y-1 overflow-hidden">
          <div className="text-body text-base font-semibold">{title}</div>
          {children != null && (
            <div className="text-(color:--grayscale-a11)">{children}</div>
          )}
        </div>
      </div>
    </>
  );

  if (href != null) {
    return (
      <FernLinkCard className={className} href={href}>
        <NoZoom>
          <DisableFernAnchor>{content}</DisableFernAnchor>
        </NoZoom>
      </FernLinkCard>
    );
  }
  return <FernCard className={className}>{content}</FernCard>;
};
