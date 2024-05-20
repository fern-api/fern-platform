import { createContext, useContext } from "react";

interface LocalPreviewContextValue {
    isLocalPreview: boolean;
}

const LocalPreviewContext = createContext<LocalPreviewContextValue>({
    isLocalPreview: false,
});

export const LocalPreviewContextProvider = LocalPreviewContext.Provider;

export function useLocalPreviewContext(): LocalPreviewContextValue {
    return useContext(LocalPreviewContext);
}
