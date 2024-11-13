"use client";

import Chat from "@/components/chat";
import { DesktopInstantSearch } from "@/components/desktop/DesktopInstantSearch";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useInitialResults } from "@/hooks/useInitialResults";
import { ReactElement, useState } from "react";
import useSWR from "swr";

export function DesktopInstantSearchClient({ appId, domain }: { appId: string; domain: string }): ReactElement | false {
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [initialInput, setInitialInput] = useState<string | undefined>(undefined);

    const handleSubmit = (path: string) => {
        window.open(`https://${domain}${path}`, "_blank", "noopener,noreferrer");
    };

    const { data: apiKey } = useSWR(
        [domain, "api-key"],
        (): Promise<string> =>
            fetch(`/api/search-key?domain=${domain}`)
                .then((res) => res.json())
                .then((data) => data.apiKey),
    );

    const { initialResults } = useInitialResults(domain);

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
                onSubmit={handleSubmit}
                onAskAI={({ initialInput }) => {
                    setInitialInput(initialInput);
                    setIsChatOpen(true);
                }}
                // disabled={isLoading || initialResultsLoading || !apiKey}
                initialResults={initialResults}
            />
            <Dialog open={isChatOpen} onOpenChange={setIsChatOpen}>
                <DialogContent>
                    <Chat initialInput={initialInput} domain={domain} />
                </DialogContent>
            </Dialog>
        </>
    );
}
