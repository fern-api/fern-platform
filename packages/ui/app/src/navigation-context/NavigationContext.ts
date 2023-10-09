import { noop } from "instantsearch.js/es/lib/utils";
import React from "react";

export const NavigationContext = React.createContext<NavigationContextValue>({
    justNavigated: false,
    hasInitialized: false,
    userIsScrolling: () => false,
    observeDocContent: noop,
});

export interface NavigationContextValue {
    justNavigated: boolean;
    hasInitialized: boolean;
    userIsScrolling: () => boolean;
    observeDocContent: (element: HTMLDivElement) => void;
}
