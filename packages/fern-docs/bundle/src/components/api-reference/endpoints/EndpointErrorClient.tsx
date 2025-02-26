"use client";

import { MouseEventHandler } from "react";

import * as ApiDefinition from "@fern-api/fdr-sdk/api-definition";
import type { APIV1Read } from "@fern-api/fdr-sdk/client/types";
import { cn } from "@fern-docs/components";
import {
  AvailabilityBadge,
  StatusCodeBadge,
} from "@fern-docs/components/badges";

export function EndpointErrorClient({
  error,
  isFirst,
  isLast,
  isSelected,
  onClick,
  availability,
  children,
}: {
  error: ApiDefinition.ErrorResponse;
  isFirst: boolean;
  isLast: boolean;
  isSelected: boolean;
  onClick: MouseEventHandler<HTMLButtonElement>;
  availability: APIV1Read.Availability | null | undefined;
  children: React.ReactNode;
}) {
  return (
    <button
      className={cn(
        "space hover:bg-(color:--grayscale-a2) flex flex-col items-start px-3 py-3 transition-colors",
        { "bg-(color:--grayscale-a2)": isSelected },
        { "border-border-default border-b": !isLast },
        { "rounded-t-[inherit]": isFirst },
        { "rounded-b-[inherit]": isLast }
      )}
      onClick={onClick}
    >
      <div className="flex items-baseline space-x-2">
        <StatusCodeBadge statusCode={error.statusCode} size="sm" />
        <div className="text-(color:--grayscale-a11) text-left text-xs">
          {error.name}
        </div>
        {availability != null && (
          <AvailabilityBadge availability={availability} size="sm" rounded />
        )}
      </div>

      {children}
    </button>
  );
}
