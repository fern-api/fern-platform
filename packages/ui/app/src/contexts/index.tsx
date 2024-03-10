import { createStore, Provider as JotaiProvider } from "jotai";
import { PropsWithChildren, ReactElement } from "react";
import { ShikiContextProvider } from "./ShikiContext";
import { ViewportContextProvider } from "./viewport-context/ViewportContextProvider";

const store = createStore();

export const CONTEXTS = [
    ({ children }: PropsWithChildren): ReactElement => <JotaiProvider store={store}>{children}</JotaiProvider>,
    ({ children }: PropsWithChildren): ReactElement => <ViewportContextProvider>{children}</ViewportContextProvider>,
    ({ children }: PropsWithChildren): ReactElement => <ShikiContextProvider>{children}</ShikiContextProvider>,
];
