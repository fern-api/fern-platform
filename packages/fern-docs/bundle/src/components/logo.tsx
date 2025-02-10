"use client";

import React from "react";

import { cn } from "@fern-docs/components";
import { DEFAULT_LOGO_HEIGHT } from "@fern-docs/utils";
import { isEqual } from "es-toolkit/predicate";

import { LogoConfiguration } from "@/components/atoms";

import { FernImage } from "./components/FernImage";
import { MaybeFernLink } from "./components/FernLink";

export const Logo = React.memo(function Logo({
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
    <MaybeFernLink href={href} className={className}>
      {light && (
        <FernImage
          className={cn("max-h-full object-contain", {
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
          className={cn("max-h-full object-contain", {
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
    </MaybeFernLink>
  );
}, isEqual);
