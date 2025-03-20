"use client";

import React, { PropsWithChildren } from "react";
import { ErrorBoundary as ReactErrorBoundary } from "react-error-boundary";

import { RefreshCcw } from "lucide-react";

import {
  FernTooltip,
  FernTooltipProvider,
  SemanticBadge,
  cn,
} from "@fern-docs/components";

export function ErrorBoundaryFallback({
  className,
  error,
  resetErrorBoundary,
}: {
  className?: string;
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
    <div className={cn("size-full py-2", className)}>
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
  fallback,
}: PropsWithChildren<{
  onResetAction?: () => void;
  fallback?: React.ReactNode;
}>) {
  if (fallback != null) {
    return (
      <ReactErrorBoundary
        onError={(error) => {
          console.error(error);
        }}
        fallback={fallback}
      >
        {children}
      </ReactErrorBoundary>
    );
  }

  return (
    <ReactErrorBoundary
      onReset={onResetAction}
      FallbackComponent={ErrorBoundaryFallback}
    >
      {children}
    </ReactErrorBoundary>
  );
}

export function withErrorBoundary<T extends React.ComponentType<any>>(
  Component: T,
  fallback?: React.ReactNode
) {
  return function WithErrorBoundary(props: React.ComponentProps<T>) {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}
