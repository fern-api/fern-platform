"use client";

import { createContext, useContext } from "react";

import { JsonPropertyPath } from "../../examples/JsonPropertyPath";

export const TypeDefinitionContext = createContext<
  () => TypeDefinitionContextValue
>(() => {
  throw new Error("TypeDefinitionContext.Provider not found in tree");
});

export interface TypeDefinitionContextValue {
  isRootTypeDefinition: boolean;
  jsonPropertyPath: JsonPropertyPath;
  isResponse: boolean | undefined;
}

export function useTypeDefinitionContext(): TypeDefinitionContextValue {
  return useContext(TypeDefinitionContext)();
}
