import { noop } from "instantsearch.js/es/lib/utils";
import React from "react";

export const NavigationContext = React.createContext<NavigationContextValue>({
    justNavigated: false,
    observeDocContent: noop,
});

export interface NavigationContextValue {
    justNavigated: boolean;
    observeDocContent: (element: HTMLDivElement) => void;
}
