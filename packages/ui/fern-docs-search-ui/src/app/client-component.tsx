"use client";

import { DesktopInstantSearch } from "@/components/desktop/DesktopInstantSearch";
import { createDefaultLinkComponent } from "@/components/shared/LinkComponent";
import { ReactElement } from "react";
import useSWR from "swr";

export function DesktopInstantSearchClient({ appId, domain }: { appId: string; domain: string }): ReactElement | false {
    const handleSubmit = ({ pathname, hash }: { pathname: string; hash: string }) => {
        window.open(`https://${domain}${pathname}${hash}`, "_blank", "noopener,noreferrer");
    };

    const { data: apiKey, isLoading } = useSWR(
        domain,
        (domain): Promise<string> =>
            fetch(`/api/search-key?domain=${domain}`)
                .then((res) => res.json())
                .then((data) => data.apiKey),
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
        />
    );
}
