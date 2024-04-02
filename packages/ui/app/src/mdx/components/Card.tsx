import cn from "clsx";
import { isValidElement } from "react";
import { RemoteFontAwesomeIcon } from "../../commons/FontAwesomeIcon";
import { FernCard, FernLinkCard } from "../../components/FernCard";
import { Badge } from "./Badge";
import "./Card.css";

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
    iconSize,
    color,
    darkModeColor,
    lightModeColor,
    iconPosition = "top",
    children,
    href,
    badge,
}) => {
    const className = cn("text-sm border p-4 not-prose rounded-lg relative block");

    const content = (
        <>
            {badge != null && (
                <Badge intent="primary" className="absolute -right-2 -top-2">
                    {badge}
                </Badge>
            )}
            <div
                className={cn("flex items-start", {
                    "space-y-3 flex-col": iconPosition === "top",
                    "space-x-3 flex-row": iconPosition === "left",
                })}
            >
                {typeof icon === "string" ? (
                    <RemoteFontAwesomeIcon
                        className="card-icon"
                        icon={icon}
                        color={color}
                        darkModeColor={darkModeColor}
                        lightModeColor={lightModeColor}
                        size={iconSize}
                    />
                ) : isValidElement(icon) ? (
                    <span
                        className="card-icon"
                        style={{
                            width: iconSize != null ? `${iconSize * 4}px` : undefined,
                            height: iconSize != null ? `${iconSize * 4}px` : undefined,
                        }}
                    >
                        {icon}
                    </span>
                ) : null}
                <div>
                    <div className="t-default text-base font-semibold">{title}</div>
                    {children != null && <div className="t-muted mt-1 leading-snug">{children}</div>}
                </div>
            </div>
        </>
    );

    if (href != null) {
        return (
            <FernLinkCard className={className} href={href}>
                {content}
            </FernLinkCard>
        );
    }
    return <FernCard className={className}>{content}</FernCard>;
};
