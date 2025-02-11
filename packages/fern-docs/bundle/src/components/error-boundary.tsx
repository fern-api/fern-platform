"use client";

import React, { PropsWithChildren, ReactElement } from "react";
import { ErrorBoundary as ReactErrorBoundary } from "react-error-boundary";

import { RefreshCcw } from "lucide-react";

import {
  FernTooltip,
  FernTooltipProvider,
  SemanticBadge,
} from "@fern-docs/components";

export function ErrorBoundaryFallback({
  error,
  resetErrorBoundary,
}: {
  error: Error & { digest?: string };
  resetErrorBoundary?: () => void;
}) {
  console.error(error);
  const errorBadge = (
    <SemanticBadge
      variant="subtle"
      intent="error"
      rounded
      onClick={resetErrorBoundary}
      interactive={resetErrorBoundary != null}
      className="m-auto flex w-fit"
    >
      Something went wrong!
      {resetErrorBoundary != null && <RefreshCcw />}
    </SemanticBadge>
  );
  return (
    <div className="size-full py-2">
      {resetErrorBoundary != null ? (
        <FernTooltipProvider>
          <FernTooltip content="Click to refresh">{errorBadge}</FernTooltip>
        </FernTooltipProvider>
      ) : (
        errorBadge
      )}
    </div>
  );
}

export function ErrorBoundary({
  children,
  onResetAction,
}: PropsWithChildren<{
  onResetAction?: () => void;
}>): ReactElement<any> {
  return (
    <ReactErrorBoundary
      onReset={onResetAction}
      FallbackComponent={ErrorBoundaryFallback}
    >
      {children}
    </ReactErrorBoundary>
  );
}
