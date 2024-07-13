import { ReactElement, createContext, useContext } from "react";

const ContentWidthContext = createContext<number | undefined>(undefined);

export function useContentWidth(): number | undefined {
    return useContext(ContentWidthContext);
}

export function ContentWidthProvider({ children, width }: { children: React.ReactNode; width: number }): ReactElement {
    return <ContentWidthContext.Provider value={width}>{children}</ContentWidthContext.Provider>;
}
