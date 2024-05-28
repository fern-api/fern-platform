import { createContext, useContext } from "react";

interface FernComponentsContextValue {
    fontAwesomeBaseUrl: string;
}

export const DEFAULT_FERN_COMPONENTS_CONTEXT_VALUE: FernComponentsContextValue = {
    fontAwesomeBaseUrl: "https://fontawesome-cdn.vercel.app",
};

const FernComponentsContext = createContext<FernComponentsContextValue>(DEFAULT_FERN_COMPONENTS_CONTEXT_VALUE);

export const useFernComponentsContext = (): FernComponentsContextValue => useContext(FernComponentsContext);

export const FernComponentsContextProvider = FernComponentsContext.Provider;
