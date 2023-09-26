import { PropsWithChildren, useCallback, useEffect, useState } from "react";
import { HashContext, HashInfo, type HashContextValue } from "./HashContext";

export declare namespace HashContextProvider {}

export const HashContextProvider: React.FC<PropsWithChildren> = ({ children }) => {
    const [hashInfo, setHashInfo] = useState<HashInfo>({ status: "loading" });

    useEffect(() => {
        if (typeof window !== "undefined") {
            if (window.location.hash.startsWith("#")) {
                const anchor = window.location.hash.substring(1, window.location.hash.length);
                const parts = anchor.split("-");
                setHashInfo({ status: "exists", parts, anchor });
            } else {
                setHashInfo({ status: "not-exists" });
            }
        }
    }, []);

    const contextValue = useCallback((): HashContextValue => ({ hashInfo }), [hashInfo]);

    return <HashContext.Provider value={contextValue}>{children}</HashContext.Provider>;
};
