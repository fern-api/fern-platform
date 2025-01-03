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
export const RemoteFontAwesomeIcon = forwardRef<
  HTMLSpanElement,
  RemoteFontAwesomeIcon.Props
>(function RemoteFontAwesomeIcon(
  { className, icon, color, darkModeColor, lightModeColor, size },
  ref
) {
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
});

function getIconUrl(icon: string | undefined): string {
  if (icon == null) {
    return "";
  }

  if (icon.startsWith("http")) {
    return icon;
  }

  const parsed = parseFontAwesomeIcon(icon);
  if (!parsed) {
    return "";
  }
  const [style, iconName] = parsed;
  return `${getCdnHost()}/${style}/${iconName}.svg`;
}

function getCdnHost() {
  return (
    (typeof process !== "undefined"
      ? // eslint-disable-next-line turbo/no-undeclared-env-vars
        process.env.NEXT_PUBLIC_FONTAWESOME_CDN_HOST
      : undefined) ?? "https://icons.ferndocs.com"
  );
}

// parse any font awesome icon into two parts: style and icon name
function parseFontAwesomeIcon(icon: string): [string, string] | undefined {
  const parts = icon.replaceAll("fa-", "").split(" ");
  if (parts.length === 0) {
    return;
  }

  // if no style is specified, default to solid style
  if (parts.length === 1 && parts[0] != null) {
    return ["solid", parts[0]];
  }

  const iconName = parts.pop();
  if (iconName == null) {
    return;
  }

  // if multiple styles are specified, join them with a dash
  const style = parts.join("-");
  return [style, iconName];
}
