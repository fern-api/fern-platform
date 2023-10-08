import { PropsWithChildren, useCallback, useEffect, useLayoutEffect, useState } from "react";
import { HEADER_HEIGHT } from "../constants";
import { extractAnchorFromWindow, getAnchorNode, getAnchorSelector } from "../util/anchor";
import { waitForDomContentToLoad, waitForElement, waitForPageToLoad } from "../util/dom";
import { sleep } from "../util/general";
import {
    NavigationContext,
    NavigationStatus,
    type NavigationContextValue,
    type NavigationInfo,
} from "./NavigationContext";

export declare namespace NavigationContextProvider {}

export const NavigationContextProvider: React.FC<PropsWithChildren> = ({ children }) => {
    const [navigationInfo, setNavigationInfo] = useState<NavigationInfo>({ status: "nil" });
    const [userHasScrolled, setUserHasScrolled] = useState(false);

    useEffect(() => {
        if (typeof window === "undefined") {
            return;
        }
        const handleScroll = () => {
            setUserHasScrolled(true);
        };
        window.addEventListener("wheel", handleScroll);
        window.addEventListener("touchmove", handleScroll);
        window.addEventListener("hashchange", handleScroll);
        return () => {
            window.addEventListener("wheel", handleScroll);
            window.removeEventListener("touchmove", handleScroll);
            window.addEventListener("hashchange", handleScroll);
        };
    }, []);

    const navigateToAnchor = useCallback(async (anchorId: string) => {
        setNavigationInfo({ status: "subsequent-navigation-to-anchor", anchorId });
        const node = getAnchorNode(anchorId);
        if (node != null) {
            node.scrollIntoView({ behavior: "smooth" });
            window.location.hash = `#${anchorId}`;
            await window.navigator.clipboard.writeText(window.location.href);
            // Need to wait some time for the scroll animation to finish. scrollIntoView() is async and there is
            // no straightforward way of us knowing whether this particular scroll has completed successfully
            await sleep(2_000);
            setNavigationInfo({ status: NavigationStatus.SUBSEQUENT_NAVIGATION_TO_ANCHOR_COMPLETE, anchorId });
        } else {
            // eslint-disable-next-line no-console
            console.error(`Could not find the node for anchor "${anchorId}". Navigation can't be completed.`);
        }
    }, []);

    const notifyIntentToGoBack = useCallback(() => {
        setNavigationInfo({ status: NavigationStatus.BACK_NAVIGATION });
    }, []);

    const markBackNavigationAsComplete = useCallback(() => {
        setNavigationInfo({ status: NavigationStatus.BACK_NAVIGATION_COMPLETE });
    }, []);

    const tryNavigateToAnchorOnPageLoad = async (anchorId: string) => {
        setNavigationInfo({ status: NavigationStatus.INITIAL_NAVIGATION_TO_ANCHOR, anchorId });
        const pageLoadPromise = waitForPageToLoad();
        const domContentLoadPromise = waitForDomContentToLoad();
        const anchorSelector = getAnchorSelector(anchorId);

        let node: HTMLElement | undefined;

        const raceResult = await Promise.race([domContentLoadPromise, waitForElement(anchorSelector)]);

        if (typeof raceResult === "object") {
            // Already found the node
            node = raceResult;
        } else if (typeof raceResult === "boolean") {
            // DOM content has been loaded but the element has still not appeared. We wait for the page to load
            // and query synchronously one last time
            await pageLoadPromise;
            node = getAnchorNode(anchorId);
        }

        if (node == null) {
            const [hrefWithoutHash] = window.location.href.split("#");
            if (hrefWithoutHash != null) {
                window.history.pushState({}, "", hrefWithoutHash);
            }
            setNavigationInfo({ status: "idle" });
            return;
        } else {
            // Wait for the page to load to avoid outdated scroll position
            await pageLoadPromise;

            const y = node.offsetTop - HEADER_HEIGHT;

            window.scrollTo({ top: y, behavior: "auto" });

            // Since scrolling is done async, we can just wait a little before updating navigation status. Alternatively,
            // we can set up a listener for scroll movements but that may be an overkill for this function
            // await sleep(500);

            setNavigationInfo({ status: NavigationStatus.INITIAL_NAVIGATION_TO_ANCHOR_COMPLETE, anchorId });
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
            setNavigationInfo({ status: "idle" });
        }
    }, []);

    useEffect(() => {
        const anchorId = extractAnchorFromWindow();
        if (typeof window === "undefined" || anchorId == null || userHasScrolled) {
            return;
        }
        const maybeScrollToSelected = () => {
            if (navigationInfo.status === NavigationStatus.INITIAL_NAVIGATION_TO_ANCHOR_COMPLETE) {
                const node = getAnchorNode(anchorId);
                if (node != null) {
                    window.scrollTo({ top: node.offsetTop, behavior: "auto" });
                }
            }
        };
        maybeScrollToSelected();
        const docsContent = document.getElementById("docs-content");
        if (docsContent == null) {
            return;
        }
        const observer = new window.ResizeObserver(() => {
            maybeScrollToSelected();
        });
        observer.observe(docsContent);
        return () => {
            observer.unobserve(docsContent);
            observer.disconnect();
        };
    }, [navigationInfo.status, userHasScrolled]);

    const contextValue = useCallback(
        (): NavigationContextValue => ({
            navigation: navigationInfo,
            navigateToAnchor,
            notifyIntentToGoBack,
            markBackNavigationAsComplete,
            userHasScrolled,
        }),
        [navigationInfo, navigateToAnchor, notifyIntentToGoBack, markBackNavigationAsComplete, userHasScrolled]
    );

    return <NavigationContext.Provider value={contextValue}>{children}</NavigationContext.Provider>;
};
