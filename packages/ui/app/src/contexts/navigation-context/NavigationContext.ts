import { noop } from "@fern-ui/core-utils";
import React from "react";

export const NavigationContext = React.createContext<NavigationContextValue>({
    onScrollToPath: noop,
});

export interface NavigationContextValue {
    onScrollToPath: (slug: string) => void;
}
