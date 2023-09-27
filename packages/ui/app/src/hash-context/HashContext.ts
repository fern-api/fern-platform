import React from "react";

export type HashInfo =
    | {
          status: "loading";
      }
    | {
          status: "navigating" | "navigated";
          /** Anchor without the leading '#' */
          anchor: string;
          parts: string[];
      }
    | {
          status: "not-exists";
      };

export const HashContext = React.createContext<() => HashContextValue>(() => {
    throw new Error("HashContextValueProvider is not present in this tree.");
});

export interface HashContextValue {
    hashInfo: HashInfo;
}
