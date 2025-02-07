"use client";

import { ColorsThemeConfig } from "@/server/types";
import cn from "clsx";
import { isEqual } from "es-toolkit/predicate";
import React from "react";

export const BgImageGradient = React.memo(
  React.forwardRef<
    React.ComponentRef<"div">,
    React.ComponentPropsWithoutRef<"div"> & {
      colors: {
        dark?: ColorsThemeConfig;
        light?: ColorsThemeConfig;
      };
      children?: never;
    }
  >(({ className, colors, ...props }, ref) => {
    const darkBackground = colors.dark?.background;
    const lightBackground = colors.light?.background;
    const darkBackgroundImage = colors.dark?.backgroundImage;
    const lightBackgroundImage = colors.light?.backgroundImage;
    return (
      <div
        ref={ref}
        className={cn(className, "fern-background", {
          "from-accent/10 bg-gradient-to-b to-transparent":
            lightBackground == null && lightBackgroundImage == null,
          "dark:from-accent/10 dark:bg-gradient-to-b dark:to-transparent":
            darkBackground == null && darkBackgroundImage == null,
          "dark:from-transparent":
            darkBackground != null && darkBackgroundImage == null,
          "fern-background-image": lightBackgroundImage != null,
          "fern-background-image-dark": darkBackgroundImage != null,
        })}
        {...props}
      />
    );
  }),
  isEqual
);
