import { PropsWithChildren, useCallback } from "react";
import {
    TypeDefinitionContext,
    TypeDefinitionContextValue,
    useTypeDefinitionContext,
} from "../context/TypeDefinitionContext.js";

export const MapTypeContextProvider: React.FC<PropsWithChildren> = ({ children }) => {
    const contextValue = useTypeDefinitionContext();
    const newContextValue = useCallback(
        (): TypeDefinitionContextValue => ({
            ...contextValue,
            jsonPropertyPath: [
                ...contextValue.jsonPropertyPath,
                {
                    type: "objectProperty",
                },
            ],
        }),
        [contextValue],
    );

    return <TypeDefinitionContext.Provider value={newContextValue}>{children}</TypeDefinitionContext.Provider>;
};
