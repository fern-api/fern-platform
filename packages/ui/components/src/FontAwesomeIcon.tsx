import cn from "clsx";
import { forwardRef } from "react";

export declare namespace RemoteFontAwesomeIcon {
    export interface Props {
        className?: string; // you must specify the bg-color rather than text-color because this is a mask.
        icon?: string; // e.g. "fas fa-home", or simply "home"
        color?: string; // ignored if lightModeColor and darkModeColor are set
        darkModeColor?: string;
        lightModeColor?: string;
        size?: number; // size in 0.25rem increments. default is 4.
    }
}
export const RemoteFontAwesomeIcon = forwardRef<HTMLSpanElement, RemoteFontAwesomeIcon.Props>(
    function RemoteFontAwesomeIcon({ className, icon, color, darkModeColor, lightModeColor, size }, ref) {
        return (
            <span
                ref={ref}
                className={cn(className, "fa-icon")}
                style={
                    {
                        maskImage: `url("${getIconUrl(icon)}")`,
                        maskRepeat: "no-repeat",
                        maskPosition: "center center",
                        WebkitMaskImage: `url("${getIconUrl(icon)}")`,
                        WebkitMaskRepeat: "no-repeat",
                        WebkitMaskPosition: "center center",
                        backgroundColor: lightModeColor ?? color,
                        "--fa-icon-dark": darkModeColor ?? color,
                        width: size != null ? `${size * 4}px` : undefined,
                        height: size != null ? `${size * 4}px` : undefined,
                    } as React.CSSProperties
                }
            />
        );
    },
);

function getIconUrl(icon: string | undefined): string {
    const parsed = parseFontAwesomeIcon(icon);
    if (!parsed) {
        return "";
    }
    const [style, iconName] = parsed;
    return `${getCdnHost()}/${style}/${iconName}.svg`;
}

function getCdnHost() {
    const CDN_HOST = process.env.NEXT_PUBLIC_FONTAWESOME_CDN_HOST;
    if (CDN_HOST == null) {
        return "https://fontawesome-cdn.vercel.app";
    }
    return CDN_HOST;
}

function parseFontAwesomeIcon(icon: string | undefined): [string, string] | undefined {
    if (!icon) {
        return;
    }
    const [left, right] = icon.split(" ");
    if (left && right) {
        return [left.replace("fa-", ""), right.replace("fa-", "")];
    }
    if (left) {
        return ["solid", left.replace("fa-", "")];
    }
    return;
}
