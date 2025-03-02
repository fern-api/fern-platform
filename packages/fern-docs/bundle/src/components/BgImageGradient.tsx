"use client";

import { cn } from "@fern-docs/components";

import { useColors } from "@/state/colors";

export function BgImageGradient({ className }: { className?: string }) {
  const colors = useColors();
  const hasDarkBackground = !!colors.dark?.background;
  const hasLightBackground = !!colors.light?.background;
  const hasDarkBackgroundImage = !!colors.dark?.backgroundImage;
  const hasLightBackgroundImage = !!colors.light?.backgroundImage;

  return (
    <div
      className={cn(className, "fern-background", {
        "from-(color:--accent)/10 bg-gradient-to-b to-transparent":
          !hasLightBackground && !hasLightBackgroundImage,
        "dark:to-(color:--accent)/10 dark:bg-gradient-to-b dark:from-transparent":
          !hasDarkBackground && !hasDarkBackgroundImage,
        "fern-background-image": hasLightBackgroundImage,
        "fern-background-image-dark": hasDarkBackgroundImage,
      })}
    />
  );
}
