"use client";

import React from "react";

import { FernButtonProps } from "@fern-docs/components";
import { useBooleanState } from "@fern-ui/react-commons";

import { FernCollapseWithButton } from "./FernCollapseWithButton";

export function FernCollapseWithButtonUncontrolled({
  isCollapsible,
  showText,
  hideText,
  buttonProps,
  children,
}: {
  isCollapsible?: boolean;
  showText: React.ReactNode;
  hideText: React.ReactNode;
  buttonProps?: Partial<FernButtonProps>;
  children: React.ReactNode;
}) {
  const state = useBooleanState(false);
  if (!isCollapsible) {
    return children;
  }
  return (
    <FernCollapseWithButton
      isOpen={state.value}
      toggleIsOpen={state.toggleValue}
      showText={showText}
      hideText={hideText}
      buttonProps={buttonProps}
    >
      {children}
    </FernCollapseWithButton>
  );
}
