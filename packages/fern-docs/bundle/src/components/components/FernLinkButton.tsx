"use client";

import Link from "next/link";
import {
  ComponentProps,
  PropsWithChildren,
  createElement,
  forwardRef,
} from "react";

import {
  ButtonContent,
  FernButtonSharedProps,
  getButtonClassName,
} from "@fern-docs/components";

import { FernLink } from "./FernLink";

interface FernLinkButtonProps
  extends ComponentProps<typeof Link>,
    PropsWithChildren<FernButtonSharedProps> {}

export const FernLinkButton = forwardRef<
  HTMLAnchorElement,
  FernLinkButtonProps
>(function FernAnchorButton(props, ref) {
  const {
    icon,
    disabled = false,
    rightIcon,
    className,
    text,
    children,
    variant,
    size,
    mono,
    intent,
    active,
    full,
    rounded,
    disableAutomaticTooltip,
    ...linkProps
  } = props;
  return (
    <FernLink
      ref={ref}
      tabIndex={0}
      aria-disabled={disabled}
      aria-selected={active}
      data-state={active ? "on" : "off"}
      data-selected={active}
      {...linkProps}
      className={getButtonClassName(props)}
      onClick={
        props.onClick != null
          ? (e) => {
              if (disabled) {
                e.preventDefault();
                e.stopPropagation();
              } else {
                props.onClick?.(e);
              }
            }
          : undefined
      }
    >
      {createElement(ButtonContent, { ...props, className: "" })}
    </FernLink>
  );
});
