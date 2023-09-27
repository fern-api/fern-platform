import { PropsWithChildren, useCallback, useEffect, useState } from "react";
import { HEADER_HEIGHT } from "../constants";
import { extractAnchorFromWindow, getAnchorNode } from "../util/anchor";
import { waitUntilPageIsLoaded } from "../util/dom";
import { sleep } from "../util/general";
import { NavigationContext, type HashInfo, type NavigationContextValue } from "./NavigationContext";

export declare namespace NavigationContextProvider {}

export const NavigationContextProvider: React.FC<PropsWithChildren> = ({ children }) => {
    const [hashInfo, setHashInfo] = useState<HashInfo>({ status: "loading" });

    const navigateToAnchorOnPageLoad = async (anchorId: string) => {
        await waitUntilPageIsLoaded();
        const node = getAnchorNode(anchorId);
        if (node != null) {
            const yOffset = -HEADER_HEIGHT;
            const y = node.getBoundingClientRect().top + window.scrollY + yOffset;
            window.scrollTo({ top: y, behavior: "auto" });
            // Since scrolling is done async, we can just wait a little before updating navigation status. Alternatively,
            // we can set up a listener for scroll movements but that may be an overkill for this function
            await sleep(300);
            setHashInfo({ status: "navigated", anchorId });
            return;
        }
    };

    useEffect(() => {
        if (typeof window === "undefined") {
            return;
        }
        const anchorId = extractAnchorFromWindow();
        if (anchorId != null) {
            const anchorId = window.location.hash.substring(1, window.location.hash.length);
            setHashInfo({ status: "navigating", anchorId });
            void navigateToAnchorOnPageLoad(anchorId);
        } else {
            setHashInfo({ status: "not-exists" });
        }
    }, []);

    const contextValue = useCallback((): NavigationContextValue => ({ hashInfo }), [hashInfo]);

    return <NavigationContext.Provider value={contextValue}>{children}</NavigationContext.Provider>;
};
