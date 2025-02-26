import { cn } from "@fern-docs/components";

import { FernColorTheme } from "@/server/types";

export function BgImageGradient({
  className,
  colors,
}: {
  className?: string;
  colors: {
    light?: FernColorTheme;
    dark?: FernColorTheme;
  };
}) {
  const isDarkBackgroundMissing =
    !colors.dark?.background ||
    colors.dark?.background.toLowerCase() === "#000";
  const isLightBackgroundMissing =
    !colors.light?.background ||
    colors.light?.background.toLowerCase() === "#fff";
  const darkBackgroundImage = colors.dark?.backgroundImage;
  const lightBackgroundImage = colors.light?.backgroundImage;

  return (
    <div
      className={cn(className, "fern-background", {
        "from-(color:--accent)/10 bg-gradient-to-b to-transparent":
          isLightBackgroundMissing && !lightBackgroundImage,
        "dark:from-(color:--accent)/20 dark:to-(color:--accent)/10 dark:bg-gradient-to-b":
          isDarkBackgroundMissing && !darkBackgroundImage,
        "dark:from-transparent":
          !isDarkBackgroundMissing || !!darkBackgroundImage,
        "fern-background-image": !!lightBackgroundImage,
        "fern-background-image-dark": !!darkBackgroundImage,
      })}
    />
  );
}
