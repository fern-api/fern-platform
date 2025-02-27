"use client";

import React from "react";

import { FernButtonProps } from "@fern-docs/components";
import {
  useBooleanState,
  useIsomorphicLayoutEffect,
} from "@fern-ui/react-commons";

import { useCurrentAnchor } from "@/hooks/use-anchor";

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
  const { collapsible, anchorIdParts } = useTypeDefinitionContext();
  const state = useBooleanState(false);
  const targetAnchor = anchorIdParts.join(".");
  const currentAnchor = useCurrentAnchor();

  useIsomorphicLayoutEffect(() => {
    if (
      currentAnchor === targetAnchor ||
      currentAnchor?.startsWith(targetAnchor + ".")
    ) {
      state.setValue(true);
    }
  }, [currentAnchor, targetAnchor]);

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
