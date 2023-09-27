import { PropsWithChildren, useCallback, useEffect, useState } from "react";
import { HEADER_HEIGHT } from "../constants";
import { getAnchorNode } from "../util/anchor";
import { waitUntilPageIsLoaded } from "../util/dom";
import { HashContext, type HashContextValue, type HashInfo } from "./HashContext";

export declare namespace HashContextProvider {}

export const HashContextProvider: React.FC<PropsWithChildren> = ({ children }) => {
    const [hashInfo, setHashInfo] = useState<HashInfo>({ status: "loading" });

    const navigateToAnchorOnPageLoad = useCallback(async (anchor: string, parts: string[]) => {
        await waitUntilPageIsLoaded();
        const node = getAnchorNode(anchor);
        if (node != null) {
            const yOffset = -HEADER_HEIGHT;
            const y = node.getBoundingClientRect().top + window.scrollY + yOffset;
            window.scrollTo({ top: y, behavior: "auto" });
            setHashInfo({ status: "navigated", anchor, parts });
            return;
        }
    }, []);

    useEffect(() => {
        if (typeof window === "undefined") {
            return;
        }
        if (window.location.hash.startsWith("#")) {
            const anchor = window.location.hash.substring(1, window.location.hash.length);
            const parts = anchor.split("-");
            setHashInfo({ status: "navigating", parts, anchor });
            void navigateToAnchorOnPageLoad(anchor, parts);
        } else {
            setHashInfo({ status: "not-exists" });
        }
    }, [navigateToAnchorOnPageLoad]);

    const contextValue = useCallback((): HashContextValue => ({ hashInfo }), [hashInfo]);

    return <HashContext.Provider value={contextValue}>{children}</HashContext.Provider>;
};
