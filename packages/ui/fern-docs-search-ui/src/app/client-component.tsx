"use client";

import { DesktopInstantSearch } from "@/components/desktop/DesktopInstantSearch";
import { createDefaultLinkComponent } from "@/components/shared/LinkComponent";
import { ReactElement } from "react";
import useSWR from "swr";

const DEFAULT_INITIAL_RESULTS = { tabs: [], products: [], versions: [] };

export function DesktopInstantSearchClient({ appId, domain }: { appId: string; domain: string }): ReactElement | false {
    const handleSubmit = (path: string) => {
        window.open(`https://${domain}${path}`, "_blank", "noopener,noreferrer");
    };

    const { data: apiKey, isLoading } = useSWR(
        [domain, "api-key"],
        (): Promise<string> =>
            fetch(`/api/search-key?domain=${domain}`)
                .then((res) => res.json())
                .then((data) => data.apiKey),
    );

    const { data: initialResults } = useSWR(
        [domain, "initial-results"],
        (): Promise<{
            tabs: { title: string; pathname: string }[];
            products: { id: string; title: string; pathname: string }[];
            versions: { id: string; title: string; pathname: string }[];
        }> => fetch(`/api/initial-result?domain=${domain}`).then((res) => res.json()),
    );

    if (!apiKey) {
        return false;
    }

    return (
        <DesktopInstantSearch
            appId={appId}
            apiKey={apiKey}
            LinkComponent={createDefaultLinkComponent(domain)}
            onSubmit={handleSubmit}
            disabled={isLoading || !apiKey}
            initialResults={initialResults ?? DEFAULT_INITIAL_RESULTS}
        />
    );
}
