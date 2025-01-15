import cn from "clsx";
import {
  AnchorHTMLAttributes,
  ComponentProps,
  createElement,
  FC,
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

export const P: FC<{ variant: "api" | "markdown" } & ComponentProps<"p">> = ({
  variant,
  className,
  ...rest
}) => {
  return <p {...rest} />;
};

export const Strong: FC<ComponentProps<"strong">> = ({
  className,
  ...rest
}) => {
  return <strong {...rest} className={cn(className, "font-semibold")} />;
};

export const Ol: FC<ComponentProps<"ol">> = ({ className, ...rest }) => {
  return (
    <ol
      {...rest}
      className={cn(className, "mb-3 list-outside list-decimal space-y-2")}
    />
  );
};

export const Ul: FC<ComponentProps<"ul">> = ({ className, ...rest }) => {
  return (
    <ul
      {...rest}
      className={cn(className, "mb-3 list-outside list-disc space-y-2")}
    />
  );
};

export const Li: FC<ComponentProps<"li">> = ({ className, ...rest }) => {
  return <li {...rest} className={cn(className)} />;
};

export const A: FC<AnchorHTMLAttributes<HTMLAnchorElement>> = ({
  className,
  children,
  href,
  ...rest
}) => {
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

export { Embed } from "./embed";
export { Image } from "./image";
