import React from "react";

import { cn } from "@fern-docs/components";

import { DisableFernAnchor, FernAnchor } from "@/components/FernAnchor";
import { FernLink } from "@/components/FernLink";

import { NoZoom, isImageElement } from "./image";

export const HeadingRenderer = (
  level: number,
  props: React.ComponentProps<"h1">
) => {
  return (
    <FernAnchor href={`#${props.id}`} asChild>
      {React.createElement(`h${level}`, props)}
    </FernAnchor>
  );
};

export function P({
  variant,
  className,
  ...rest
}: { variant: "api" | "markdown" } & React.ComponentProps<"p">) {
  return <p {...rest} />;
}

export function Strong({ className, ...rest }: React.ComponentProps<"strong">) {
  return <strong {...rest} className={cn(className, "font-semibold")} />;
}

export function Ol({ className, ...rest }: React.ComponentProps<"ol">) {
  return (
    <ol {...rest} className={cn(className, "mb-3 list-outside list-decimal")} />
  );
}

export function Ul({ className, ...rest }: React.ComponentProps<"ul">) {
  return (
    <ul
      {...rest}
      className={cn(
        className,
        "[&>li]:before:text-(color:--grayscale-a10) mb-3 list-none pl-3 [&>li]:pl-3 [&>li]:before:absolute [&>li]:before:ml-[-22px] [&>li]:before:mt-[-1px] [&>li]:before:content-['-']"
      )}
    />
  );
}

export function Li({ className, ...rest }: React.ComponentProps<"li">) {
  return <li {...rest} className={cn(className)} />;
}

export function A({
  className,
  children,
  href,
  ...rest
}: React.ComponentProps<"a">) {
  const cnCombined = cn("fern-mdx-link", className);
  const hideExternalLinkIcon =
    React.isValidElement(children) &&
    (children.type === "img" || isImageElement(children));

  return (
    <FernLink
      className={cnCombined}
      href={href ?? {}}
      scroll={true}
      {...rest}
      showExternalLinkIcon={!hideExternalLinkIcon}
    >
      <NoZoom>
        <DisableFernAnchor>{children}</DisableFernAnchor>
      </NoZoom>
    </FernLink>
  );
}

export { Image } from "./image";
