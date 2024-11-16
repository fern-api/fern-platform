import { LiteClient, liteClient } from "algoliasearch/lite";
import { ReactNode, createContext, useContext, useEffect, useMemo, useRef } from "react";

const SearchClientContext = createContext<{ searchClient: LiteClient; apiKey: string; domain: string } | undefined>(
    undefined,
);

export function SearchClientProvider({
    children,
    appId,
    apiKey,
    domain,
}: {
    children: ReactNode;
    appId: string;
    apiKey: string;
    domain: string;
}): ReactNode {
    const client = useRef(liteClient(appId, apiKey));

    useEffect(() => {
        client.current.setClientApiKey({ apiKey });
        void client.current.clearCache();
    }, [apiKey]);

    const value = useMemo(() => ({ searchClient: client.current, apiKey, domain }), [apiKey, domain]);

    return <SearchClientContext.Provider value={value}>{children}</SearchClientContext.Provider>;
}

export function useSearchClient(): { searchClient: LiteClient; apiKey: string; domain: string } {
    const value = useContext(SearchClientContext);
    if (!value) {
        throw new Error("useSearchClient must be used within a SearchClientProvider");
    }
    return value;
}
