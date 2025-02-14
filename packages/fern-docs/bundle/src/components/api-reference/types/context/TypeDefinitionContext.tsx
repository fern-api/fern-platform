"use client";

import { createContext, useContext, useMemo } from "react";
import React from "react";

import { StoreApi, UseBoundStore, create } from "zustand";

import { TypeDefinition } from "@fern-api/fdr-sdk/api-definition";
import { useLazyRef } from "@fern-ui/react-commons";

import { ErrorBoundary } from "@/components/error-boundary";

import { JsonPropertyPath } from "../../examples/JsonPropertyPath";
import { JsonPropertyPathPart } from "../../examples/JsonPropertyPath";

interface TypeDefinitionContextValue {
  types: Record<string, TypeDefinition>;
  isRootTypeDefinition: boolean;
  jsonPropertyPath: JsonPropertyPath;
  isResponse: boolean | undefined;

  useSlots: UseBoundStore<StoreApi<Record<string, React.ReactNode>>>;
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
}: {
  children: React.ReactNode;
  types: Record<string, TypeDefinition>;
}) {
  const contextValue = useLazyRef(() => ({
    isRootTypeDefinition: true,
    jsonPropertyPath: [],
    isResponse: undefined,
    types,
    useSlots: create<Record<string, React.ReactNode>>(() => ({})),
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

export function useTypeDefinition(id: string) {
  const context = useTypeDefinitionContext();
  return context.types[id];
}

export function TypeDefinitionSlot({
  id,
  isCollapsible,
}: {
  id: string;
  isCollapsible?: boolean;
}) {
  const { useSlots } = useTypeDefinitionContext();
  const slot = useSlots((s) => s[id]);

  if (React.isValidElement<{ isCollapsible?: boolean }>(slot)) {
    return React.cloneElement(slot, {
      isCollapsible,
    });
  }

  return slot;
}

const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? React.useEffect : React.useLayoutEffect;

export function useSetTypeDefinitionSlots(
  slots: Record<string, React.ReactNode>
) {
  const { useSlots } = useTypeDefinitionContext();

  useIsomorphicLayoutEffect(() => {
    useSlots.setState((prev) => ({
      ...prev,
      ...slots,
    }));
  }, [slots, useSlots]);
}

export function SetTypeDefinitionSlots({
  slots,
  children,
}: {
  slots: Record<string, React.ReactNode>;
  children: React.ReactNode;
}) {
  useSetTypeDefinitionSlots(slots);
  return children;
}
