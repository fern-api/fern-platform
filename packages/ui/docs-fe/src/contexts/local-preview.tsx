import { PropsWithChildren, ReactElement, createContext, useContext } from "react";

const LocalPreviewContext = createContext<boolean>(false);

export const useIsLocalPreview = (): boolean => {
    return useContext(LocalPreviewContext);
};

export const LocalPreviewContextProvider = ({ children }: PropsWithChildren): ReactElement => {
    return <LocalPreviewContext.Provider value={true}>{children}</LocalPreviewContext.Provider>;
};
