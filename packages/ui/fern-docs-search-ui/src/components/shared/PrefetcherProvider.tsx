import { ReactNode, createContext, useContext } from "react";

type Prefetcher = (path: string) => Promise<void>;

const PrefetcherContext = createContext<Prefetcher>(() => Promise.resolve());

export function PrefetcherProvider({
    children,
    prefetcher,
}: {
    children: ReactNode;
    prefetcher: Prefetcher;
}): ReactNode {
    return <PrefetcherContext.Provider value={prefetcher}>{children}</PrefetcherContext.Provider>;
}

export function usePrefetcher(): Prefetcher {
    return useContext(PrefetcherContext);
}
