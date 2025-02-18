"use client";

import React from "react";

import { FernButtonProps } from "@fern-docs/components";
import { useBooleanState } from "@fern-ui/react-commons";

import { FernCollapseWithButton } from "./FernCollapseWithButton";
import { useTypeDefinitionContext } from "./TypeDefinitionContext";

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
  const { collapsible } = useTypeDefinitionContext();
  const state = useBooleanState(false);

  if (!collapsible) {
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
