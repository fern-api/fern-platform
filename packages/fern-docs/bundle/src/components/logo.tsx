import React from "react";

import { cn } from "@fern-docs/components";
import { DEFAULT_LOGO_HEIGHT } from "@fern-docs/utils";

import { LogoText } from "@/state/logo-text";
import type { LogoConfiguration } from "@/state/types";

import { FernImage } from "./FernImage";
import { MaybeFernLink } from "./FernLink";

export function Logo({
  logo,
  className,
  alt,
}: {
  logo: LogoConfiguration;
  className?: string;
  alt?: string;
}) {
  const { light, dark, height, href } = logo;

  const style = {
    height: height ?? DEFAULT_LOGO_HEIGHT,
    width: "auto",
  };

  return (
    <MaybeFernLink href={href} className={cn(className, "flex items-center")}>
      {light && (
        <FernImage
          className={cn("max-h-full object-contain max-md:!max-h-8", {
            "block dark:hidden": !!dark,
          })}
          alt={alt ?? light.alt ?? "Logo"}
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
          className={cn("max-h-full object-contain max-md:!max-h-8", {
            "hidden dark:block": !!light,
          })}
          alt={alt ?? dark.alt ?? "Logo"}
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

      <LogoText className="ml-1" />
    </MaybeFernLink>
  );
}
