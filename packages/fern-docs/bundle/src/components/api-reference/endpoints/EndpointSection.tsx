import "server-only";

import React from "react";

import { Separator } from "@/components/Separator";
import { ErrorBoundary } from "@/components/error-boundary";

import { SectionContainer, TypeDefinitionAnchor } from "./TypeDefinitionAnchor";

export function EndpointSection({
  title,
  description,
  children,
  hideSeparator,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  hideSeparator?: boolean;
}) {
  return (
    <ErrorBoundary>
      <SectionContainer className="space-y-3">
        <TypeDefinitionAnchor>
          <h3 className="mt-0">{title}</h3>
        </TypeDefinitionAnchor>
        {description}
        {hideSeparator ? null : <Separator />}
        {children}
      </SectionContainer>
    </ErrorBoundary>
  );
}
