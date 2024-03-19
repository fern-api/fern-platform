import cn from "clsx";
import { isValidElement } from "react";
import { RemoteFontAwesomeIcon } from "../../commons/FontAwesomeIcon";
import { FernCard, FernLinkCard } from "../../components/FernCard";
import "./Card.css";

export declare namespace Card {
    export interface Props {
        title: string;
        icon?: unknown;
        color?: string; // ignored if lightModeColor and darkModeColor are set
        darkModeColor?: string;
        lightModeColor?: string;

        children?: string;
        href?: string;
        iconPosition?: "top" | "left";
    }
}

export const Card: React.FC<Card.Props> = ({
    title,
    icon,
    color,
    darkModeColor,
    lightModeColor,
    iconPosition = "top",
    children,
    href,
}) => {
    const className = cn("text-sm flex items-start border p-4 grow basis-1/4 not-prose rounded-lg", {
        "space-y-3 flex-col": iconPosition === "top",
        "space-x-3 flex-row": iconPosition === "left",
    });

    const content = (
        <>
            {typeof icon === "string" ? (
                <RemoteFontAwesomeIcon
                    className="card-icon"
                    icon={icon}
                    color={color}
                    darkModeColor={darkModeColor}
                    lightModeColor={lightModeColor}
                />
            ) : isValidElement(icon) ? (
                <span className="card-icon">{icon}</span>
            ) : null}
            <div>
                <div className="t-default text-base font-semibold">{title}</div>
                {children != null && <div className="t-muted mt-1 leading-snug">{children}</div>}
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
