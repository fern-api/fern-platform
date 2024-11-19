"use client";

import Chat from "@/components/chat";
import { DesktopInstantSearch } from "@/components/desktop/DesktopInstantSearch";
import { SearchClientProvider } from "@/components/shared/SearchClientProvider";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ReactElement, useState } from "react";
import useSWR from "swr";
import { z } from "zod";

const USER_TOKEN_KEY = "user-token";

const ApiKeySchema = z.object({
    apiKey: z.string(),
});

export function DesktopInstantSearchClient({ appId, domain }: { appId: string; domain: string }): ReactElement | false {
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [initialInput, setInitialInput] = useState<string | undefined>(undefined);

    const handleSubmit = (path: string) => {
        window.open(`https://${domain}${path}`, "_blank", "noopener,noreferrer");
    };

    const { data } = useSWR([domain, "api-key"], async (): Promise<{ apiKey: string; userToken: string }> => {
        const userToken = window.sessionStorage.getItem(USER_TOKEN_KEY) ?? `anonymous-user-${crypto.randomUUID()}`;
        window.sessionStorage.setItem(USER_TOKEN_KEY, userToken);
        const res = await fetch(`/api/search-key?domain=${domain}`, {
            headers: { "X-User-Token": userToken },
        });
        const { apiKey } = ApiKeySchema.parse(await res.json());
        return { apiKey, userToken };
    });

    if (!data) {
        return false;
    }

    const { apiKey, userToken } = data;

    return (
        <>
            <SearchClientProvider appId={appId} apiKey={apiKey} domain={domain} indexName="fern-docs-search">
                <DesktopInstantSearch
                    onSelect={handleSubmit}
                    onAskAI={({ initialInput }) => {
                        setInitialInput(initialInput);
                        setIsChatOpen(true);
                    }}
                    userToken={userToken}
                    accentForegroundColor="#0851BE"
                    accentBackgroundColor="#EAF3FF"
                    accentForegroundColorDark="#5495F8"
                    accentBackgroundColorDark="#092148"
                />
            </SearchClientProvider>
            <Dialog open={isChatOpen} onOpenChange={setIsChatOpen}>
                <DialogContent>
                    <Chat initialInput={initialInput} domain={domain} />
                </DialogContent>
            </Dialog>
        </>
    );
}
