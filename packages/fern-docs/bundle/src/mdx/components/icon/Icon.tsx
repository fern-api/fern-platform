import { FaIcon, cn } from "@fern-docs/components";

export function Icon({
  className,
  icon,
  size = 4,
  color,
  darkModeColor,
  lightModeColor,
}: {
  className?: string; // you must specify the bg-color rather than text-color because this is a mask.
  icon?: string; // e.g. "fas fa-home", or simply "home"
  color?: string; // ignored if lightModeColor and darkModeColor are set
  darkModeColor?: string;
  lightModeColor?: string;
  size?: number; // size in 0.25rem increments. default is 4.
}) {
  return (
    <FaIcon
      className={cn(className, "fern-mdx-icon")}
      icon={icon ?? ""}
      style={
        {
          color: lightModeColor ?? color,
          "--fa-icon-dark": darkModeColor ?? color,
          width: size * 4,
          height: size * 4,
        } as React.CSSProperties
      }
    />
  );
}
