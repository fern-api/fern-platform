import cn from "clsx";
import {
  AnchorHTMLAttributes,
  ComponentProps,
  ComponentPropsWithRef,
  createElement,
  isValidElement,
  ReactElement,
} from "react";
import { FernAnchor } from "../../../components/FernAnchor";
import { FernLink } from "../../../components/FernLink";
import { isImageElement, NoZoom } from "./image";

export const HeadingRenderer = (
  level: number,
  props: ComponentProps<"h1">
): ReactElement => {
  return (
    <FernAnchor href={`#${props.id}`}>
      {createElement(`h${level}`, props)}
    </FernAnchor>
  );
};

export const Strong = ({
  className,
  ...rest
}: ComponentPropsWithRef<"strong">) => {
  return <strong {...rest} className={cn(className, "font-semibold")} />;
};

export const Ol = ({ className, ...rest }: ComponentPropsWithRef<"ol">) => {
  return (
    <ol
      {...rest}
      className={cn(className, "mb-3 list-outside list-decimal space-y-2")}
    />
  );
};

export const Ul = ({ className, ...rest }: ComponentPropsWithRef<"ul">) => {
  return (
    <ul
      {...rest}
      className={cn(className, "mb-3 list-outside list-disc space-y-2")}
    />
  );
};

export const Li = ({ className, ...rest }: ComponentPropsWithRef<"li">) => {
  return <li {...rest} className={cn(className)} />;
};

export const A = ({
  className,
  children,
  href,
  ...rest
}: AnchorHTMLAttributes<HTMLAnchorElement>) => {
  const cnCombined = cn("fern-mdx-link", className);
  const hideExternalLinkIcon =
    isValidElement(children) &&
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
};

export { Image } from "./image";
