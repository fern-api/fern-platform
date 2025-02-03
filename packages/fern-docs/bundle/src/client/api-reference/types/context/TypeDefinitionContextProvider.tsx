import { PropsWithChildren, useCallback } from "react";
import { JsonPropertyPath } from "../../examples/JsonPropertyPath";
import {
  TypeDefinitionContext,
  TypeDefinitionContextValue,
} from "./TypeDefinitionContext";

export declare namespace TypeReferenceDefinitions {
  export type Props = PropsWithChildren<{
    onHoverProperty:
      | ((path: JsonPropertyPath, opts: { isHovering: boolean }) => void)
      | undefined;
    isResponse?: boolean;
  }>;
}

export const TypeDefinitionContextProvider: React.FC<
  TypeReferenceDefinitions.Props
> = ({ onHoverProperty, isResponse, children }) => {
  const contextValue = useCallback(
    (): TypeDefinitionContextValue => ({
      isRootTypeDefinition: true,
      jsonPropertyPath: [],
      onHoverProperty,
      isResponse,
    }),
    [isResponse, onHoverProperty]
  );

  return (
    <TypeDefinitionContext.Provider value={contextValue}>
      {children}
    </TypeDefinitionContext.Provider>
  );
};
