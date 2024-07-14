import { createContext } from "react";
import { noop } from "ts-essentials";

export const NavigationContext = createContext<NavigationContextValue>({
    onScrollToPath: noop,
});

export interface NavigationContextValue {
    onScrollToPath: (slug: string) => void;
}
