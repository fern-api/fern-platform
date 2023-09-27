import { PropsWithChildren, useCallback, useEffect, useState } from "react";
import { HEADER_HEIGHT } from "../constants";
import { getAnchorNode } from "../util/anchor";
import { waitUntilPageIsLoaded } from "../util/dom";
import { sleep } from "../util/general";
import { NavigationContext, type HashInfo, type NavigationContextValue } from "./NavigationContext";

export declare namespace NavigationContextProvider {}

export const NavigationContextProvider: React.FC<PropsWithChildren> = ({ children }) => {
    const [hashInfo, setHashInfo] = useState<HashInfo>({ status: "loading" });

    const navigateToAnchorOnPageLoad = async (anchor: string, parts: string[]) => {
        await waitUntilPageIsLoaded();
        const node = getAnchorNode(anchor);
        if (node != null) {
            const yOffset = -HEADER_HEIGHT;
            const y = node.getBoundingClientRect().top + window.scrollY + yOffset;
            window.scrollTo({ top: y, behavior: "auto" });
            // Since scrolling is done async, we can just wait a little before updating navigation status. Alternatively,
            // we can set up a listener for scroll movements but that may be an overkill for this function
            await sleep(300);
            setHashInfo({ status: "navigated", anchor, parts });
            return;
        }
    };

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
    }, []);

    const contextValue = useCallback((): NavigationContextValue => ({ hashInfo }), [hashInfo]);

    return <NavigationContext.Provider value={contextValue}>{children}</NavigationContext.Provider>;
};
