import { PropsWithChildren, useCallback, useLayoutEffect, useState } from "react";
import { HEADER_HEIGHT } from "../constants";
import { extractAnchorFromWindow, getAnchorNode, getAnchorSelector } from "../util/anchor";
import { waitForDomContentToLoad, waitForElement, waitForPageToLoad } from "../util/dom";
import { sleep } from "../util/general";
import { NavigationContext, type NavigationContextValue, type NavigationInfo } from "./NavigationContext";

export declare namespace NavigationContextProvider {}

export const NavigationContextProvider: React.FC<PropsWithChildren> = ({ children }) => {
    const [navigationInfo, setNavigationInfo] = useState<NavigationInfo>({ status: "nil" });

    const navigateToAnchor = useCallback(async (anchorId: string) => {
        setNavigationInfo({ status: "subsequent-navigation-to-anchor", anchorId });
        const node = getAnchorNode(anchorId);
        if (node != null) {
            node.scrollIntoView({ behavior: "smooth" });
            window.location.hash = `#${anchorId}`;
            await window.navigator.clipboard.writeText(window.location.href);
            await sleep(2_000);
            setNavigationInfo({ status: "subsequent-navigation-to-anchor-complete", anchorId });
        } else {
            // eslint-disable-next-line no-console
            console.error(`Could not find the node for anchor "${anchorId}". Navigation can't be completed.`);
        }
    }, []);

    const markNavigationStatusAsIdle = useCallback(async () => {
        await sleep(200);
        setNavigationInfo({ status: "idle" });
    }, []);

    const tryNavigateToAnchorOnPageLoad = async (anchorId: string) => {
        setNavigationInfo({ status: "initial-navigation-to-anchor", anchorId });
        const pageLoadPromise = waitForPageToLoad();
        const domContentLoadPromise = waitForDomContentToLoad();
        const anchorSelector = getAnchorSelector(anchorId);
        let node = await waitForElement(anchorSelector);
        if (node == null) {
            await domContentLoadPromise;
            // Wait for 3 more seconds
            node = await waitForElement(anchorSelector, 3_000);
        }
        if (node == null) {
            window.location.hash = "";
            setNavigationInfo({ status: "idle" });
            return;
        } else {
            const yOffset = -HEADER_HEIGHT;
            const y = node.getBoundingClientRect().top + window.scrollY + yOffset;

            // Wait for page to load to avoid outdated scroll position
            await pageLoadPromise;

            window.scrollTo({ top: y, behavior: "auto" });

            // Since scrolling is done async, we can just wait a little before updating navigation status. Alternatively,
            // we can set up a listener for scroll movements but that may be an overkill for this function
            await sleep(500);

            setNavigationInfo({ status: "initial-navigation-to-anchor-complete", anchorId });
        }
    };

    useLayoutEffect(() => {
        if (typeof window === "undefined") {
            return;
        }
        const anchorId = extractAnchorFromWindow();
        if (anchorId != null) {
            void tryNavigateToAnchorOnPageLoad(anchorId);
        } else {
            void markNavigationStatusAsIdle();
        }
    }, [markNavigationStatusAsIdle]);

    const contextValue = useCallback(
        (): NavigationContextValue => ({
            navigation: navigationInfo,
            navigateToAnchor,
        }),
        [navigationInfo, navigateToAnchor]
    );

    return <NavigationContext.Provider value={contextValue}>{children}</NavigationContext.Provider>;
};
