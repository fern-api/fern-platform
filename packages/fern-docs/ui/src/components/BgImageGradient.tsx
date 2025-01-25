"use client";

import type { ColorsConfig } from "@fern-platform/fdr-utils";
import cn from "clsx";
import { useColors } from "../atoms";

export declare namespace BgImageGradient {
  export interface Props {
    className?: string;
  }
}

export const BgImageGradient = ({
  className,
  colors,
}: {
  className?: string;
  colors: Partial<ColorsConfig>;
}) => {
  const darkBackground = colors.dark?.background;
  const lightBackground = colors.light?.background;
  const darkBackgroundImage = colors.dark?.backgroundImage;
  const lightBackgroundImage = colors.light?.backgroundImage;

  return (
    <div
      className={cn(className, "fern-background", {
        "from-accent/10 bg-gradient-to-b to-transparent":
          lightBackground?.type === "gradient" && lightBackgroundImage == null,
        "dark:from-accent/10 dark:bg-gradient-to-b dark:to-transparent":
          darkBackground?.type === "gradient" && darkBackgroundImage == null,
        "dark:from-transparent":
          darkBackground?.type === "solid" && darkBackgroundImage == null,
        "fern-background-image": lightBackgroundImage != null,
        "fern-background-image-dark": darkBackgroundImage != null,
      })}
    />
  );
};

export const BgImageGradientWithAtom = ({
  className,
}: {
  className?: string;
}) => {
  const colors = useColors();
  return <BgImageGradient className={className} colors={colors} />;
};
