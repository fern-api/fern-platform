import React from "react";

export type HashInfo =
    | {
          status: "loading";
      }
    | {
          status: "navigating" | "navigated";
          /** Anchor without the leading '#' */
          anchorId: string;
      }
    | {
          status: "not-exists";
      };

export const NavigationContext = React.createContext<() => NavigationContextValue>(() => {
    throw new Error("NavigationContextValueProvider is not present in this tree.");
});

export interface NavigationContextValue {
    hashInfo: HashInfo;
}
