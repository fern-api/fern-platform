"use client";

import React from "react";

import { FernButtonProps } from "@fern-docs/components";
import { useBooleanState } from "@fern-ui/react-commons";

import { FernCollapseWithButton } from "./FernCollapseWithButton";

export function FernCollapseWithButtonUncontrolled({
  showText,
  hideText,
  buttonProps,
  children,
}: {
  showText: React.ReactNode;
  hideText: React.ReactNode;
  buttonProps?: Partial<FernButtonProps>;
  children: React.ReactNode;
}) {
  const state = useBooleanState(false);
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
