import { createContext, useContext } from "react";

export const ApiPageContext = createContext<boolean>(false);

export function useApiPageContext(): boolean {
    return useContext(ApiPageContext);
}
