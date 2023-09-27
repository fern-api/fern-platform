import React from "react";

export type NavigationInfo =
    | {
          status: "nil";
      }
    | {
          status:
              | "initial-navigation-to-anchor"
              | "initial-navigation-to-anchor-complete"
              | "subsequent-navigation-to-anchor"
              | "subsequent-navigation-to-anchor-complete";
          /** Anchor without the leading '#' */
          anchorId: string;
      }
    | {
          status: "idle";
      };

export const NavigationContext = React.createContext<() => NavigationContextValue>(() => {
    throw new Error("NavigationContextValueProvider is not present in this tree.");
});

export interface NavigationContextValue {
    navigation: NavigationInfo;
    navigateToAnchor: (anchorId: string) => Promise<void>;
}
