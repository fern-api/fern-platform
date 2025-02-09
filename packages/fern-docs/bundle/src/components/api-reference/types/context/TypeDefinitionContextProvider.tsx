import { PropsWithChildren, useCallback } from "react";
import {
  TypeDefinitionContext,
  TypeDefinitionContextValue,
} from "./TypeDefinitionContext";

export declare namespace TypeReferenceDefinitions {
  export type Props = PropsWithChildren<{
    isResponse?: boolean;
  }>;
}

export const TypeDefinitionContextProvider: React.FC<
  TypeReferenceDefinitions.Props
> = ({ isResponse, children }) => {
  const contextValue = useCallback(
    (): TypeDefinitionContextValue => ({
      isRootTypeDefinition: true,
      jsonPropertyPath: [],
      isResponse,
    }),
    [isResponse]
  );

  return (
    <TypeDefinitionContext.Provider value={contextValue}>
      {children}
    </TypeDefinitionContext.Provider>
  );
};
