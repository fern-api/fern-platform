import cn from "clsx";
import React from "react";
import { FernAnchor } from "../../../components/FernAnchor";
import { FernLink } from "../../../components/FernLink";
import { isImageElement, NoZoom } from "./image";

export const HeadingRenderer = (
  level: number,
  props: React.ComponentProps<"h1">
): React.ReactElement<any> => {
  return (
    <FernAnchor href={`#${props.id}`}>
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
    <ol
      {...rest}
      className={cn(className, "mb-3 list-outside list-decimal space-y-2")}
    />
  );
}

export function Ul({ className, ...rest }: React.ComponentProps<"ul">) {
  return (
    <ul
      {...rest}
      className={cn(className, "mb-3 list-outside list-disc space-y-2")}
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
      {...rest}
      showExternalLinkIcon={!hideExternalLinkIcon}
    >
      <NoZoom>{children}</NoZoom>
    </FernLink>
  );
}

export { Image } from "./image";
