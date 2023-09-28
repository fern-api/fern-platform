import React from "react";

interface NavigationInfoNil {
    status: "nil";
}

interface NavigationInfoInitialNavigationToAnchor {
    status: "initial-navigation-to-anchor";
    /** Anchor without the leading '#' */
    anchorId: string;
}

interface NavigationInfoInitialNavigationToAnchorComplete {
    status: "initial-navigation-to-anchor-complete";
    /** Anchor without the leading '#' */
    anchorId: string;
}

interface NavigationInfoSubsequentNavigationToAnchor {
    status: "subsequent-navigation-to-anchor";
    /** Anchor without the leading '#' */
    anchorId: string;
}

interface NavigationInfoSubsequentNavigationToAnchorComplete {
    status: "subsequent-navigation-to-anchor-complete";
    /** Anchor without the leading '#' */
    anchorId: string;
}

interface NavigationInfoIdle {
    status: "idle";
}

export type NavigationInfo =
    | NavigationInfoNil
    | NavigationInfoInitialNavigationToAnchor
    | NavigationInfoInitialNavigationToAnchorComplete
    | NavigationInfoSubsequentNavigationToAnchor
    | NavigationInfoSubsequentNavigationToAnchorComplete
    | NavigationInfoIdle;

export const NavigationStatus = {
    NIL: "nil",
    INITIAL_NAVIGATION_TO_ANCHOR: "initial-navigation-to-anchor",
    INITIAL_NAVIGATION_TO_ANCHOR_COMPLETE: "initial-navigation-to-anchor-complete",
    SUBSEQUENT_NAVIGATION_TO_ANCHOR: "subsequent-navigation-to-anchor",
    SUBSEQUENT_NAVIGATION_TO_ANCHOR_COMPLETE: "subsequent-navigation-to-anchor-complete",
    IDLE: "idle",
} as const;

export type NavigationStatus = typeof NavigationStatus[keyof typeof NavigationStatus];

export const NavigationContext = React.createContext<() => NavigationContextValue>(() => {
    throw new Error("NavigationContextValueProvider is not present in this tree.");
});

export interface NavigationContextValue {
    navigation: NavigationInfo;
    navigateToAnchor: (anchorId: string) => Promise<void>;
}
