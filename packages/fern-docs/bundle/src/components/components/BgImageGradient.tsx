import { cn } from "@fern-docs/components";

import { ColorsThemeConfig } from "@/server/types";

export const BgImageGradient = ({
  className,
  colors,
}: {
  className?: string;
  colors: {
    light?: ColorsThemeConfig;
    dark?: ColorsThemeConfig;
  };
}) => {
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
};
