"use client";

import Chat from "@/components/chat";
import { DesktopInstantSearch } from "@/components/desktop/DesktopInstantSearch";
import { SearchClientProvider } from "@/components/shared/SearchClientProvider";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import Head from "next/head";
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

    if (!apiKey) {
        return false;
    }

    return (
        <>
            <Head>
                <link
                    key={`preload-facets-${domain}`}
                    rel="preload"
                    href={`/api/facet-values?domain=${domain}`}
                    as="fetch"
                    crossOrigin="anonymous"
                />
            </Head>
            <div className="max-h-[50vh] overflow-hidden flex flex-col">
                <SearchClientProvider appId={appId} apiKey={apiKey} domain={domain}>
                    <DesktopInstantSearch
                        onSubmit={handleSubmit}
                        onAskAI={({ initialInput }) => {
                            setInitialInput(initialInput);
                            setIsChatOpen(true);
                        }}
                    />
                </SearchClientProvider>
            </div>
            <Dialog open={isChatOpen} onOpenChange={setIsChatOpen}>
                <DialogContent>
                    <Chat initialInput={initialInput} domain={domain} />
                </DialogContent>
            </Dialog>
        </>
    );
}
