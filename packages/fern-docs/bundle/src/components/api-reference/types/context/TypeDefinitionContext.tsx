"use client";

import { createContext, useContext } from "react";
import React from "react";

import { TypeDefinition } from "@fern-api/fdr-sdk/api-definition";
import { useLazyRef } from "@fern-ui/react-commons";

import { ErrorBoundary } from "@/components/error-boundary";

import { JsonPropertyPath } from "../../examples/JsonPropertyPath";
import { JsonPropertyPathPart } from "../../examples/JsonPropertyPath";

export const TypeDefinitionContext = createContext<
  () => TypeDefinitionContextValue
>(() => {
  throw new Error("TypeDefinitionContext.Provider not found in tree");
});

export interface TypeDefinitionContextValue {
  types: Record<string, TypeDefinition>;
  isRootTypeDefinition: boolean;
  jsonPropertyPath: JsonPropertyPath;
  isResponse: boolean | undefined;
}

export function useTypeDefinitionContext(): TypeDefinitionContextValue {
  return useContext(TypeDefinitionContext)();
}

export function TypeDefinitionRoot({
  children,
  types,
}: {
  children: React.ReactNode;
  types: Record<string, TypeDefinition>;
}) {
  const contextValue = useLazyRef(() => () => ({
    isRootTypeDefinition: true,
    jsonPropertyPath: [],
    isResponse: undefined,
    types,
  }));

  return (
    <ErrorBoundary>
      <TypeDefinitionContext.Provider value={contextValue.current}>
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
  const contextValue = useLazyRef(() => () => ({
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

export function TypeDefinitionResponse({
  children,
}: {
  children: React.ReactNode;
}) {
  const parent = useTypeDefinitionContext();
  const contextValue = useLazyRef(() => () => ({
    ...parent,
    isResponse: true,
  }));

  return (
    <TypeDefinitionContext.Provider value={contextValue.current}>
      {children}
    </TypeDefinitionContext.Provider>
  );
}
