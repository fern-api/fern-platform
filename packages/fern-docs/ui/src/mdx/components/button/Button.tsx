import { FernButton } from "@fern-docs/components";
import clsx from "clsx";
import { ReactElement, ReactNode } from "react";
import { FernLinkButton } from "../../../components/FernLinkButton";

export declare namespace Button {
  export interface Props {
    className?: string;
    icon?: string | ReactNode;
    rightIcon?: string | ReactNode;
    minimal?: boolean;
    outlined?: boolean;
    mono?: boolean;
    full?: boolean;
    rounded?: boolean;
    active?: boolean;
    disabled?: boolean;
    small?: boolean;
    large?: boolean;
    intent?: "none" | "primary" | "success" | "warning" | "danger";
    text?: ReactNode;
    href?: string;
    download?: any;
  }
}

export function Button({
  minimal,
  outlined,
  small,
  large,
  href,
  className,
  intent = "primary",
  ...props
}: Button.Props): ReactElement {
  const variant = outlined ? "outlined" : minimal ? "minimal" : "filled";
  const size = small ? "small" : large ? "large" : "normal";
  if (href != null) {
    return (
      <FernLinkButton
        href={href}
        {...props}
        variant={variant}
        size={size}
        intent={intent}
        className={clsx(className, "not-prose")}
      />
    );
  }

  return (
    <FernButton
      {...props}
      variant={variant}
      size={size}
      intent={intent}
      className={clsx(className, "not-prose")}
    />
  );
}
