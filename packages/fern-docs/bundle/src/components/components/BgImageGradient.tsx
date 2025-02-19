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
  const darkBackground = colors.dark?.background;
  const lightBackground = colors.light?.background;
  const darkBackgroundImage = colors.dark?.backgroundImage;
  const lightBackgroundImage = colors.light?.backgroundImage;

  return (
    <div
      className={cn(className, "fern-background", {
        "from-accent/10 bg-gradient-to-b to-transparent":
          !lightBackground && lightBackgroundImage == null,
        "dark:from-accent/10 dark:bg-gradient-to-b dark:to-transparent":
          !darkBackground && darkBackgroundImage == null,
        "dark:from-transparent": darkBackground && darkBackgroundImage == null,
        "fern-background-image": lightBackgroundImage != null,
        "fern-background-image-dark": darkBackgroundImage != null,
      })}
    />
  );
}
