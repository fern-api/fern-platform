"use client";

import { usePathname } from "next/navigation";
import { createContext, useContext, useMemo } from "react";
import React from "react";

import { TypeDefinition } from "@fern-api/fdr-sdk/api-definition";
import { addLeadingSlash } from "@fern-docs/utils";
import { useLazyRef } from "@fern-ui/react-commons";

import { ErrorBoundary } from "@/components/error-boundary";
import { useCurrentAnchor } from "@/hooks/use-anchor";

import { JsonPropertyPath } from "../examples/JsonPropertyPath";
import { JsonPropertyPathPart } from "../examples/JsonPropertyPath";

interface TypeDefinitionContextValue {
  types: Record<string, TypeDefinition>;
  isRootTypeDefinition: boolean;
  jsonPropertyPath: JsonPropertyPath;
  isResponse: boolean | undefined;
  slug: string;
  anchorIdParts: readonly string[];
  collapsible: boolean;
}

export const TypeDefinitionContext = createContext<
  () => TypeDefinitionContextValue
>(() => {
  throw new Error("TypeDefinitionContext.Provider not found in tree");
});

export function useTypeDefinitionContext(): TypeDefinitionContextValue {
  return useContext(TypeDefinitionContext)();
}

export function TypeDefinitionRoot({
  children,
  types,
  slug,
}: {
  children: React.ReactNode;
  types: Record<string, TypeDefinition>;
  slug: string;
}) {
  const contextValue = useLazyRef(() => ({
    isRootTypeDefinition: true,
    jsonPropertyPath: [],
    isResponse: undefined,
    types,
    slug,
    anchorIdParts: [],
    collapsible: false,
  }));

  return (
    <ErrorBoundary>
      <TypeDefinitionContext.Provider
        value={useMemo(() => () => contextValue.current, [contextValue])}
      >
        {children}
      </TypeDefinitionContext.Provider>
    </ErrorBoundary>
  );
}

export function TypeDefinitionPathPart({
  children,
  part,
}: {
  children: React.ReactNode;
  part: JsonPropertyPathPart;
}) {
  const parent = useTypeDefinitionContext();
  const contextValue = React.useRef(() => ({
    ...parent,
    isRootTypeDefinition: false,
    jsonPropertyPath: [...parent.jsonPropertyPath, part],
  }));

  return (
    <TypeDefinitionContext.Provider value={contextValue.current}>
      {children}
    </TypeDefinitionContext.Provider>
  );
}

export function TypeDefinitionAnchorPart({
  children,
  part,
}: {
  children: React.ReactNode;
  part: string;
}) {
  const parent = useTypeDefinitionContext();
  const contextValue = React.useRef(() => ({
    ...parent,
    anchorIdParts: [...parent.anchorIdParts, part],
  }));

  return (
    <TypeDefinitionContext.Provider value={contextValue.current}>
      {children}
    </TypeDefinitionContext.Provider>
  );
}

export function TypeDefinitionResponse({
  children,
}: {
  children: React.ReactNode;
}) {
  const parent = useTypeDefinitionContext();
  const contextValue = React.useRef(() => ({
    ...parent,
    isResponse: true,
  }));

  return (
    <TypeDefinitionContext.Provider value={contextValue.current}>
      {children}
    </TypeDefinitionContext.Provider>
  );
}

export function TypeDefinitionCollapsible({
  children,
}: {
  children: React.ReactNode;
}) {
  const parent = useTypeDefinitionContext();
  const contextValue = React.useRef(() => ({
    ...parent,
    collapsible: true,
  }));

  if (parent.collapsible) {
    return children;
  }

  return (
    <TypeDefinitionContext.Provider value={contextValue.current}>
      {children}
    </TypeDefinitionContext.Provider>
  );
}

export function TypeDefinitionUncollapsible({
  children,
}: {
  children: React.ReactNode;
}) {
  const parent = useTypeDefinitionContext();
  const contextValue = React.useRef(() => ({
    ...parent,
    collapsible: false,
  }));

  if (parent.collapsible) {
    return children;
  }

  return (
    <TypeDefinitionContext.Provider value={contextValue.current}>
      {children}
    </TypeDefinitionContext.Provider>
  );
}

export function useTypeDefinition(id: string) {
  const context = useTypeDefinitionContext();
  return context.types[id];
}

export function useAnchorId(): string | null {
  const { anchorIdParts } = useTypeDefinitionContext();
  return anchorIdParts.length > 0 ? anchorIdParts.join(".") : null;
}

export function useHref(): string {
  const { slug, anchorIdParts } = useTypeDefinitionContext();
  const pathname = addLeadingSlash(slug);
  return `${pathname}${anchorIdParts.length > 0 ? `#${anchorIdParts.join(".")}` : ""}`;
}

export function useIsActive(): boolean {
  const currentPathname = usePathname();
  const currentAnchor = useCurrentAnchor();
  const currentHref = `${currentPathname}${currentAnchor ? `#${currentAnchor}` : ""}`;
  const href = useHref();
  return currentHref === href;
}
