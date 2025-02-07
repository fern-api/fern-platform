"use client";

import { LogoConfiguration } from "@/components/atoms";
import { FernImage } from "@/components/image";
import { MaybeFernLink } from "@/components/link";
import { cn } from "@fern-docs/components";
import { DEFAULT_LOGO_HEIGHT } from "@fern-docs/utils";
import { isEqual } from "es-toolkit/predicate";
import React from "react";

export const Logo = React.memo(({ logo }: { logo: LogoConfiguration }) => {
  const { light, dark, height, href } = logo;

  const style = {
    height: height ?? DEFAULT_LOGO_HEIGHT,
    width: "auto",
  };

  return (
    <MaybeFernLink href={href}>
      {light && (
        <FernImage
          className={cn("max-h-full object-contain", {
            "block dark:hidden": !!dark,
          })}
          alt={light.alt ?? "Logo"}
          src={light.src}
          height={light.height}
          width={light.width}
          blurDataURL={light.blurDataURL}
          priority
          loading="eager"
          quality={100}
          style={style}
        />
      )}
      {dark && (
        <FernImage
          className={cn("max-h-full object-contain", {
            "hidden dark:block": !!light,
          })}
          alt={dark.alt ?? "Logo"}
          src={dark.src}
          height={dark.height}
          width={dark.width}
          blurDataURL={dark.blurDataURL}
          priority
          loading="eager"
          quality={100}
          style={style}
        />
      )}
    </MaybeFernLink>
  );
}, isEqual);
