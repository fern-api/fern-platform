import { PropsWithChildren, useCallback, useLayoutEffect, useState } from "react";
import { HEADER_HEIGHT } from "../constants";
import { extractAnchorFromWindow, getAnchorSelector } from "../util/anchor";
import { waitForElement, waitForPageLoad } from "../util/dom";
import { sleep } from "../util/general";
import { NavigationContext, type HashInfo, type NavigationContextValue } from "./NavigationContext";

export declare namespace NavigationContextProvider {}

export const NavigationContextProvider: React.FC<PropsWithChildren> = ({ children }) => {
    const [hashInfo, setHashInfo] = useState<HashInfo>({ status: "loading" });

    const tryNavigateToAnchorOnPageLoad = async (anchorId: string) => {
        const pageLoadPromise = waitForPageLoad();
        const anchorSelector = getAnchorSelector(anchorId);
        let node = await waitForElement(anchorSelector);
        if (node == null) {
            await pageLoadPromise;
            // Wait for 3 more seconds
            node = await waitForElement(anchorSelector, 3_000);
        }
        if (node == null) {
            // TODO: Handle properly
            return;
        } else {
            const yOffset = -HEADER_HEIGHT;
            const y = node.getBoundingClientRect().top + window.scrollY + yOffset;

            // Wait for page to load to avoid outdated scroll position
            await pageLoadPromise;

            window.scrollTo({ top: y, behavior: "auto" });

            // Since scrolling is done async, we can just wait a little before updating navigation status. Alternatively,
            // we can set up a listener for scroll movements but that may be an overkill for this function
            await sleep(300);

            setHashInfo({ status: "navigated", anchorId });
        }
    };

    useLayoutEffect(() => {
        if (typeof window === "undefined") {
            return;
        }
        const anchorId = extractAnchorFromWindow();
        if (anchorId != null) {
            setHashInfo({ status: "navigating", anchorId });
            void tryNavigateToAnchorOnPageLoad(anchorId);
        } else {
            setHashInfo({ status: "not-exists" });
        }
    }, []);

    const contextValue = useCallback((): NavigationContextValue => ({ hashInfo }), [hashInfo]);

    return <NavigationContext.Provider value={contextValue}>{children}</NavigationContext.Provider>;
};
