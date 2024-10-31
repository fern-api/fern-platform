"use client";

import { DesktopInstantSearch } from "@/components/desktop/DesktopInstantSearch";
import { createDefaultLinkComponent } from "@/components/shared/LinkComponent";
import { useInitialResults } from "@/hooks/useInitialResults";
import { ReactElement } from "react";
import useSWR from "swr";

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

    const { initialResults, isLoading: initialResultsLoading } = useInitialResults(domain);

    if (!apiKey) {
        return false;
    }

    return (
        <>
            {initialResults.versions.length > 0 && (
                <select>
                    {initialResults.versions.map((version) => (
                        <option key={version.title} value={version.title}>
                            {version.title}
                        </option>
                    ))}
                </select>
            )}
            <DesktopInstantSearch
                appId={appId}
                apiKey={apiKey}
                LinkComponent={createDefaultLinkComponent(domain)}
                onSubmit={handleSubmit}
                disabled={isLoading || initialResultsLoading || !apiKey}
                initialResults={initialResults}
            />
        </>
    );
}
